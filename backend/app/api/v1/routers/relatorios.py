import logging
logging.basicConfig(level=logging.INFO)

from collections import defaultdict
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_db, get_current_user
from app.models.domain import Participacao, Usuario
from app.schemas.relatorio import (
    AreaMes,
    DetalheParticipacao,
    ParticipacaoMes,
    RelatoriosResponse,
)

router = APIRouter()

def month_label(month_num: int) -> str:
    """Retorna o nome abreviado do mês em português (Jan, Fev, ...)."""
    nomes = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
    ]
    return nomes[month_num - 1]

@router.get(
    "/",
    response_model=RelatoriosResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter dados para relatórios com filtro opcional por período",
)
async def obter_relatorios(
    data_inicio: Optional[date] = Query(
        None, description="Data inicial (inclusive) para filtrar participações"
    ),
    data_fim: Optional[date] = Query(
        None, description="Data final (inclusive) para filtrar participações"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> RelatoriosResponse:
    """Retorna participações e áreas agregadas por mês dentro do intervalo solicitado.

    Se nenhum parâmetro for informado, retorna todos os registros.
    """
    # Construir a consulta base
    # selectinload de entrevistado e programa: precisamos dos nomes, não só
    # dos ids, tanto para os agregados por área quanto para o detalhamento.
    stmt = select(Participacao).options(
        selectinload(Participacao.entrevistado),
        selectinload(Participacao.programa),
    )
    logging.info("Query built with data_inicio=%s data_fim=%s", data_inicio, data_fim)

    if data_inicio:
        stmt = stmt.where(Participacao.data_hora >= datetime.combine(data_inicio, datetime.min.time()))
    if data_fim:
        stmt = stmt.where(Participacao.data_hora <= datetime.combine(data_fim, datetime.max.time()))

    result = await db.execute(stmt)
    participacoes: List[Participacao] = result.scalars().all()
    logging.info("Fetched %d participacoes after filtering", len(participacoes))

    # Agrupar por mês (total geral)
    mapa_mes: dict[tuple[int, int], dict] = defaultdict(lambda: {"total": 0, "ref": None})
    for p in participacoes:
        if not p.data_hora:
            continue
        mes = p.data_hora.month
        ano = p.data_hora.year
        chave = (ano, mes)
        mapa_mes[chave]["total"] += 1
        if mapa_mes[chave]["ref"] is None:
            mapa_mes[chave]["ref"] = date(ano, mes, 1)

    participacoes_chart: List[ParticipacaoMes] = [
        ParticipacaoMes(
            mes=f"{month_label(mes)}/{ano}",
            total=info["total"],
            data_referencia=info["ref"],
        )
        for (ano, mes), info in sorted(mapa_mes.items())
    ]

    # Agrupar por área e mês (formato longo)
    mapa_area_mes: dict[tuple[str, int, int], dict] = defaultdict(lambda: {"total": 0, "ref": None})
    for p in participacoes:
        if not (p.data_hora and p.entrevistado):
            continue
        area = p.entrevistado.area_atuacao
        mes = p.data_hora.month
        ano = p.data_hora.year
        chave = (area, ano, mes)
        mapa_area_mes[chave]["total"] += 1
        if mapa_area_mes[chave]["ref"] is None:
            mapa_area_mes[chave]["ref"] = date(ano, mes, 1)

    areas_chart: List[AreaMes] = [
        AreaMes(
            area=area,
            mes=f"{month_label(mes)}/{ano}",
            total=info["total"],
            data_referencia=info["ref"],
        )
        for (area, ano, mes), info in sorted(mapa_area_mes.items())
    ]

    # Detalhamento linha a linha: uma entrada por participação, já com os
    # nomes de entrevistado e programa resolvidos (não só os ids), para os
    # relatórios que precisam listar quem foi entrevistado e em qual programa.
    detalhes: List[DetalheParticipacao] = [
        DetalheParticipacao(
            id=p.id,
            data=p.data_hora.strftime("%d/%m/%Y"),
            data_referencia=p.data_hora.date(),
            nome_entrevistado=p.entrevistado.nome_completo if p.entrevistado else "—",
            area_atuacao=p.entrevistado.area_atuacao if p.entrevistado else "—",
            nome_programa=p.programa.nome if p.programa else "—",
            tema_abordado=p.tema_abordado,
        )
        for p in sorted(participacoes, key=lambda x: x.data_hora)
        if p.data_hora
    ]

    return RelatoriosResponse(
        participacoes=participacoes_chart,
        areas=areas_chart,
        detalhes=detalhes,
    )