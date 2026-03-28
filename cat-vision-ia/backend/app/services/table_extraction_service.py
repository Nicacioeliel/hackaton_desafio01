import json
import logging
from io import StringIO
from pathlib import Path

import pandas as pd
import pdfplumber

logger = logging.getLogger(__name__)


def extract_tables_from_pdf(path: Path) -> list[dict]:
    """Extrai tabelas com pdfplumber; retorna lista {name, csv, json}."""
    out: list[dict] = []
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages[:10]):
                tables = page.extract_tables() or []
                for j, table in enumerate(tables):
                    if not table or len(table) < 2:
                        continue
                    df = pd.DataFrame(table[1:], columns=table[0])
                    buf = StringIO()
                    df.to_csv(buf, index=False)
                    name = f"page{i+1}_table{j+1}"
                    out.append(
                        {
                            "table_name": name,
                            "csv_content": buf.getvalue(),
                            "json_content": df.to_json(orient="records", force_ascii=False),
                        }
                    )
    except Exception as e:
        logger.warning("table extraction failed: %s", e)
    return out
