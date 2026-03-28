from app.models.art import Art


def art_to_compare_dict(art: Art) -> dict[str, str | None]:
    return {
        "numero_art": art.numero_art,
        "profissional_nome": art.profissional_nome,
        "crea_rnp": art.rnp or art.registro,
        "contratante_nome": art.contratante_nome,
        "cnpj": art.contratante_cnpj,
        "numero_contrato": art.numero_contrato,
        "objeto": art.objeto,
        "data_inicio": art.data_inicio,
        "data_fim": art.data_fim,
        "endereco": art.endereco,
        "cidade_uf": (
            f"{art.cidade or ''}-{art.uf or ''}".strip("-") if art.cidade or art.uf else None
        ),
        "cidade": art.cidade,
        "uf": art.uf,
        "valor": str(art.valor_contrato) if art.valor_contrato is not None else None,
        "atividades_tecnicas": art.atividades_tecnicas,
        "quantitativos": art.quantitativos,
    }
