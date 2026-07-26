from collections import defaultdict
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_db, get_current_user
from app.models.domain import Participacao, Usuario
from app.schemas.relatorio import RelatoriosResponse

router = APIRouter()

@router.get("/", response_model=RelatoriosResponse, status_code=status.HTTP_200_OK, summary="Obter dados para gráficos de relatórios")
async def obter_relatorios(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Buscar todas as participações com detalhes do entrevistado para extrair a área de atuação
    stmt = select(Participacao).options(selectinload(Participacao.entrevistado))
    result = await db.execute(stmt)
    participacoes = result.scalars().all()

    meses_nome = {
        1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio", 6: "Junho",
        7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }

    # 1. Agrupar participações por mês
    participacoes_por_mes = defaultdict(int)
    for p in participacoes:
        if p.data_hora:
            mes_num = p.data_hora.month
            mes_nome = meses_nome.get(mes_num, "Desconhecido")
            participacoes_por_mes[mes_nome] += 1

    participacoes_chart = [
        {"mes": mes, "total": total} for mes, total in participacoes_por_mes.items()
    ]
    
    # Ordenar cronologicamente conforme a ordem dos meses do ano
    mes_order = {v: k for k, v in meses_nome.items()}
    participacoes_chart.sort(key=lambda x: mes_order.get(x["mes"], 99))

    # 2. Agrupar participações por área para Abril e Maio
    areas_data = defaultdict(lambda: {"abr": 0, "mai": 0})
    for p in participacoes:
        if p.entrevistado and p.data_hora:
            area = p.entrevistado.area_atuacao
            mes = p.data_hora.month
            if mes == 4:
                areas_data[area]["abr"] += 1
            elif mes == 5:
                areas_data[area]["mai"] += 1

    areas_chart = []
    for area, counts in areas_data.items():
        areas_chart.append({
            "area": area,
            "abr": counts["abr"],
            "mai": counts["mai"]
        })

    return {
        "participacoes": participacoes_chart,
        "areas": areas_chart
    }
