"""Convert scraped Apps Script directory JSON into DirectoryEntry seed."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "src" / "data" / "apps-script-directory-raw.json"
OUT = ROOT / "src" / "data" / "snhc-directory.json"
META_OUT = ROOT / "src" / "data" / "apps-script-directory-meta.json"


def parse_staff_label(label: str) -> tuple[str, str, str]:
    """Return (person, designation, department)."""
    text = re.sub(r"\s+", " ", (label or "").strip())
    if not text:
        return "Unknown", "Staff", "—"

    # Apps Script staff rows use "Name, Department" when both are known.
    if "," in text:
        left, right = text.rsplit(",", 1)
        person = left.strip(" -")
        dept = right.strip(" -")
        if person and dept and not re.fullmatch(r"\d+", dept):
            return person, "Staff", dept

    # Office / room style labels: keep full text as the display name.
    return text, "Staff", text


def main() -> None:
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    published = (raw.get("published") or "").strip()
    # published chip text may include helpdesk lines mixed in totalText; keep raw chips from scrape
    meta = {
        "source": "apps-script",
        "url": (
            "https://script.google.com/macros/s/"
            "AKfycbzySdeUADo7lWCGsuCANCYzMJ-pEMIKQywbUjz9zLP_giqNuyienmwsdW354uNeu7C8/exec"
        ),
        "publishedChip": published,
        "totalText": raw.get("totalText") or "",
        "mgmtCount": raw.get("mgmtCount"),
        "staffCount": raw.get("staffCount"),
        "asOn": "05-Sep-2026",
        "helpdesk": {
            "label": "IT Help Desk (0930-1730) Week days",
            "extensions": ["1559"],
            "mobile": "8800011659",
        },
    }

    entries: list[dict] = []
    seen: set[str] = set()
    updated_at = "2026-09-05T00:00:00.000Z"

    for i, row in enumerate(raw.get("management") or [], start=1):
        label = str(row.get("label") or "").strip()
        ext = str(row.get("ext") or "").strip()
        key = f"mgmt|{ext}|{label.lower()}"
        if not ext or key in seen:
            continue
        seen.add(key)
        entries.append(
            {
                "id": f"as-mgmt-{i:03d}",
                "person": label,
                "designation": label,
                "department": "Management Team",
                "floor": "—",
                "zone": "—",
                "email": "",
                "mobile": "",
                "extension": ext,
                "updatedAt": updated_at,
            }
        )

    staff_i = 0
    for row in raw.get("staff") or []:
        label = str(row.get("label") or "").strip()
        ext = str(row.get("ext") or "").strip()
        key = f"staff|{ext}|{label.lower()}"
        if not ext or key in seen:
            continue
        seen.add(key)
        staff_i += 1
        person, designation, department = parse_staff_label(label)
        entries.append(
            {
                "id": f"as-staff-{staff_i:03d}",
                "person": person,
                "designation": designation,
                "department": department,
                "floor": "—",
                "zone": "—",
                "email": "",
                "mobile": "",
                "extension": ext,
                "updatedAt": updated_at,
            }
        )

    OUT.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    META_OUT.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("entries", len(entries), "->", OUT)
    print("meta ->", META_OUT)


if __name__ == "__main__":
    main()
