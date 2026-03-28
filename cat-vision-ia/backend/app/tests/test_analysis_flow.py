"""Fluxo E2E completo recomenda-se com banco de arquivo + upload real em CI local."""

import pytest

pytestmark = pytest.mark.skip(reason="E2E opcional — executar manualmente na demo")
