from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError

from app.db.database import AsyncSessionLocal
from app.core.config import settings
from app.models.domain import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# ⚠️ O gerador agora é async e utiliza o context manager async with
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> Usuario:
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Adaptação para a sintaxe async do SQLAlchemy 2.0
    result = await db.execute(select(Usuario).filter(Usuario.email == email))
    user = result.scalars().first()
    
    if user is None or not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Usuário inativo ou inexistente"
        )
        
    return user