from rapidfuzz import fuzz


def semantic_object_score(a: str | None, b: str | None) -> float:
    if not a or not b:
        return 0.0
    return fuzz.token_set_ratio(a.lower(), b.lower()) / 100.0


def address_similarity(a: str | None, b: str | None) -> float:
    if not a or not b:
        return 0.0
    return fuzz.partial_ratio(
        a.lower().replace(",", " "), b.lower().replace(",", " ")
    ) / 100.0
