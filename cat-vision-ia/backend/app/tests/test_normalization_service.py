from app.services.normalization_service import normalize_field


def test_normalize_cnpj():
    assert normalize_field("cnpj", "36.408.654/0001-04") == "36408654000104"


def test_normalize_generic():
    assert normalize_field("x", "João  Silva") == "joao silva"
