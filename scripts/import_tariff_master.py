"""Import full Tariff Master Excel — one row per tariff/billing line."""
from __future__ import annotations

import json
from pathlib import Path

import openpyxl

XLSX = Path(r"C:\Users\IT\Downloads\Tariff_Master.xlsx")
OUT = Path(__file__).resolve().parents[1] / "public" / "data" / "tariff-master.json"


def main() -> None:
    wb = openpyxl.load_workbook(XLSX, data_only=True, read_only=True)
    ws = wb.active
    rows = ws.iter_rows(values_only=True)
    header = next(rows)
    print("sheet", ws.title)
    print("header", header)

    out: list[dict] = []
    for row in rows:
        if not row:
            continue
        (
            tariff,
            stype,
            sitem,
            code,
            billing,
            _eff,
            priority,
            price,
            dept,
            _ctype,
            subdept,
            _care,
            status,
        ) = (list(row) + [None] * 13)[:13]
        if not sitem:
            continue
        try:
            price_num = float(price) if price is not None and str(price).strip() != "" else None
            if price_num is not None and price_num == int(price_num):
                price_num = int(price_num)
        except (TypeError, ValueError):
            price_num = None

        out.append(
            {
                "tariff": tariff or "CASH",
                "serviceType": stype or "",
                "serviceItem": str(sitem).strip(),
                "code": (code or "").strip() if isinstance(code, str) else (str(code).strip() if code else ""),
                "billingCategory": billing or "",
                "priority": priority or "",
                "price": price_num,
                "department": dept or "",
                "subDepartment": subdept or "",
                "status": status or "",
            }
        )

    OUT.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print("wrote", len(out), "rows ->", OUT)
    carpal = [r for r in out if r["serviceItem"].lower() == "carpal tunnel syndrome"]
    print("carpal tunnel syndrome rows", len(carpal))
    for r in carpal:
        print(r["billingCategory"], r["price"], r["code"])


if __name__ == "__main__":
    main()
