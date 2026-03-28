from types import SimpleNamespace

from app.services.art_parser_service import art_to_compare_dict
from app.services.comparison_service import compare_art_act


def test_compare_compatible_art_numero():
    art = SimpleNamespace(
        numero_art="MA20250929762",
        profissional_nome="Fulano",
        rnp="123",
        registro=None,
        contratante_nome="Empresa",
        contratante_cnpj="36408654000104",
        numero_contrato="0352015",
        valor_contrato=100.0,
        data_inicio="2025-05-12",
        data_fim="2025-06-24",
        endereco="Rua A",
        cidade="Pastos Bons",
        uf="MA",
        objeto="Iluminação",
        atividades_tecnicas=None,
        quantitativos=None,
    )
    flat = art_to_compare_dict(art)  # type: ignore[arg-type]
    act = {
        "numero_art": "MA20250929762",
        "profissional_nome": "Fulano",
        "crea_rnp": "123",
        "contratante_nome": "Empresa",
        "cnpj": "36.408.654/0001-04",
        "numero_contrato": "0352015",
        "objeto": "Iluminação pública",
        "endereco": "Rua A",
        "cidade_uf": "Pastos Bons-MA",
        "data_inicio": "2025-05-12",
        "data_fim": "2025-06-24",
        "valor": "100.0",
        "atividades_tecnicas": None,
        "quantitativos": None,
    }
    results = compare_art_act(flat, act)
    nums = [r for r in results if r.field_name == "numero_art"]
    assert nums and nums[0].status == "COMPATIVEL"
