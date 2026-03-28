from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class ArtRead(ORMModel):
    id: int
    numero_art: str
    tipo_art: str | None = None
    profissional_nome: str | None = None
    titulo_profissional: str | None = None
    rnp: str | None = None
    registro: str | None = None
    empresa_contratada: str | None = None
    contratante_nome: str | None = None
    contratante_cnpj: str | None = None
    numero_contrato: str | None = None
    valor_contrato: float | None = None
    data_inicio: str | None = None
    data_fim: str | None = None
    endereco: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    uf: str | None = None
    cep: str | None = None
    objeto: str | None = None
    observacoes: str | None = None
    status_art: str | None = None
    atividades_tecnicas: str | None = None
    quantitativos: str | None = None
    created_at: datetime | None = None


class ArtListResponse(ORMModel):
    items: list[ArtRead] = Field(default_factory=list)
    total: int = 0
