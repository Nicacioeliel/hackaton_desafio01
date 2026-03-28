import re


def is_valid_cnpj_digits(digits: str) -> bool:
    if len(digits) != 14 or not digits.isdigit():
        return False
    if len(set(digits)) == 1:
        return False

    def calc(base: str, factors: list[int]) -> int:
        s = sum(int(base[i]) * factors[i] for i in range(len(factors)))
        r = s % 11
        return 0 if r < 2 else 11 - r

    n = digits[:12]
    d1 = calc(n, list(range(5, 1, -1)) + list(range(9, 1, -1)))
    d2 = calc(n + str(d1), list(range(6, 1, -1)) + list(range(9, 1, -1)))
    return digits[-2:] == f"{d1}{d2}"


def only_digits(s: str) -> str:
    return re.sub(r"\D", "", s or "")
