"""
Popula ARTs de demonstração (hackathon CREA-MA).
Execute a partir da pasta backend: python -m app.seeds.seed_arts
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, init_db
from app.models.art import Art


def seed_arts(db: Session) -> None:
    samples = [
        {
            "numero_art": "MA20250929762",
            "tipo_art": "Obra/Serviço",
            "profissional_nome": "Alexandre de Moraes Bueno Neto",
            "titulo_profissional": "Engenheiro Eletricista",
            "rnp": "1120893194",
            "registro": "MA1120893194",
            "empresa_contratada": "Taboca Agro Negócios Ltda",
            "contratante_nome": "Taboca Agro Negócios Ltda",
            "contratante_cnpj": "36.408.654/0001-04",
            "numero_contrato": "0352015",
            "valor_contrato": 125000.00,
            "data_inicio": "2025-05-12",
            "data_fim": "2025-06-24",
            "endereco": "Fazenda PV Curral Velho",
            "cidade": "Pastos Bons",
            "uf": "MA",
            "objeto": "Projeto elétrico com 50 pontos de iluminação em instalações rurais",
            "atividades_tecnicas": "Dimensionamento, memorial descritivo e ART de execução",
            "quantitativos": "50 pontos de iluminação",
            "status_art": "Ativa",
        },
        {
            "numero_art": "MA20250957723",
            "tipo_art": "Serviço",
            "profissional_nome": "Eng. Responsável ART (Caso Demo Divergente)",
            "titulo_profissional": "Engenheiro Civil",
            "rnp": "9999999999",
            "registro": "MA9999999",
            "empresa_contratada": "Construtora Demo Norte Ltda",
            "contratante_nome": "Secretaria Municipal de Saúde (exemplo)",
            "contratante_cnpj": "00.000.000/0001-99",
            "numero_contrato": "14/2024",
            "valor_contrato": 818582.00,
            "data_inicio": "2024-01-01",
            "data_fim": "2025-12-31",
            "endereco": "Município referência: Buriticupu / Arame (cenário demo)",
            "cidade": "Amarante",
            "uf": "MA",
            "objeto": "Obras e serviços de infraestrutura vinculados a contrato 14/2024 (demo)",
            "atividades_tecnicas": "Supervisão, projetos complementares",
            "quantitativos": "Conforme planilha do contrato",
            "status_art": "Ativa",
        },
    ]
    for s in samples:
        exists = db.execute(
            select(Art).where(Art.numero_art == s["numero_art"])
        ).scalar_one_or_none()
        if exists:
            continue
        db.add(Art(**s))
    db.commit()


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        seed_arts(db)
        print("Seed de ARTs concluído.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
