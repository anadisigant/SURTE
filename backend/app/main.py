from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Importação de todas as rotas da V1
from app.api.v1.routers import auth, entrevistados, programas, usuarios, entrevistas

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registo de todos os módulos na API com os seus respetivos prefixos e tags
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Autenticação"])
app.include_router(entrevistados.router, prefix=f"{settings.API_V1_STR}/entrevistados", tags=["Entrevistados"])
app.include_router(programas.router, prefix=f"{settings.API_V1_STR}/programas", tags=["Programas"])
app.include_router(usuarios.router, prefix=f"{settings.API_V1_STR}/usuarios", tags=["Usuários"])
app.include_router(entrevistas.router, prefix=f"{settings.API_V1_STR}/entrevistas", tags=["Entrevistas"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "API SURTE Completa e Operante"}
