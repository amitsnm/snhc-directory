"""Parse SNHC Directory PDF (25-Aug-2026) into directory JSON."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import fitz

PDF = Path(r"c:\Users\IT\Downloads\SNHC Directory 20260825.pdf")
OUT = Path(r"c:\Users\IT\Documents\dir\src\data\snhc-directory.json")

# Three data columns: (name_xmin, name_xmax, ext_xmin, ext_xmax)
COLUMNS = [
    (40, 165, 165, 200),
    (200, 340, 340, 380),
    (380, 515, 515, 560),
]

JUNK = re.compile(
    r"(designation|extn\.?|management team|published|sant nirankari|extension directory|"
    r"^name$|^no\.?$|25aug|week days|it help desk|0930)",
    re.I,
)


def clean_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip(" ,/-")
    name = name.replace(" ,", ",")
    name = re.sub(r",\s*", ", ", name)
    replacements = {
        "Dailysis-Office": "Dialysis - Office",
        "Blood Bank- Reception": "Blood Bank - Reception",
        "IVF- Reception": "IVF - Reception",
        "Chemotherapy- Doctor Room": "Chemotherapy - Doctor Room",
        "Chemotherapy- Doctor": "Chemotherapy - Doctor Room",
        "Molly Thomas,DNS": "Molly Thomas, DNS",
        "Deepak vats, Security": "Deepak Vats, Security",
        "Deepak vats , Security": "Deepak Vats, Security",
        "Counselling Room- IVF": "Counselling Room - IVF",
        "Consultant Room 2- IVF": "Consultant Room 2 - IVF",
        "Consultant Room 1- IVF": "Consultant Room 1 - IVF",
        "Room Consultant Room 2- IVF": "Consultant Room 2 - IVF",
    }
    return replacements.get(name, name)


def classify(name: str) -> tuple[str, str, str]:
    leadership = {"CEO", "COO", "CFO", "CCS", "MS", "CNO"}
    if name in leadership:
        return name, name, "Leadership"

    if name == "PRO":
        return "PRO", "PRO", "Clinical / Services"

    if "," in name:
        person, role = [p.strip() for p in name.split(",", 1)]
        return person, role or "Staff", "Management Team"

    if re.search(
        r"\b(OPD|Room|Reception|Counter|NS-|Pharmacy|Centre|Admission|TPA|USG|TMT|"
        r"Radiology|Radiologist|Chemotherapy|Daycare|Physiotherapy|Blood|IVF|Dialysis|"
        r"Fire|Services|Clinical|Healthcheckup|EWS|ER|Account|Contact|Ops team|Marketing|"
        r"Manager Operations)\b",
        name,
        re.I,
    ):
        return name, "Extension", "Clinical / Services"

    return name, "Staff", "General"


def main() -> None:
    doc = fitz.open(PDF)
    page = doc[0]
    words = page.get_text("words")

    lines: dict[float, list] = defaultdict(list)
    for w in words:
        y = round(w[1] / 2) * 2
        lines[y].append(w)

    pairs: list[tuple[str, str]] = []
    pending: dict[int, str] = {}

    for y in sorted(lines.keys()):
        if y < 110:
            continue
        ws = sorted(lines[y], key=lambda w: w[0])
        for ci, (nmin, nmax, emin, emax) in enumerate(COLUMNS):
            name_tokens = [w[4] for w in ws if nmin <= w[0] < nmax]
            ext_tokens = [
                w[4] for w in ws if emin <= w[0] < emax and re.fullmatch(r"\d{3,5}", w[4])
            ]
            name = clean_name(" ".join(name_tokens))
            if name and JUNK.search(name):
                name = ""
            # Header row "Name Extn. No." around y 167
            if 160 <= y <= 175:
                name = ""

            ext = ext_tokens[-1] if ext_tokens else None

            if name and not ext:
                prev = pending.get(ci, "")
                pending[ci] = clean_name(f"{prev} {name}".strip())
                continue

            if not ext:
                continue

            full = name
            if ci in pending and pending[ci]:
                held = pending.pop(ci)
                full = clean_name(f"{held} {name}".strip() if name else held)

                full_name = clean_name(full)
            # Fix wrap artifact
            if full.startswith("Room Consultant"):
                full = full.replace("Room Consultant", "Consultant", 1)
            full = clean_name(full)
            if not full or JUNK.search(full):
                continue
            if full.lower() in {"name", "no.", "extn.", "designation"}:
                continue

            pairs.append((full, ext))

    # Deduplicate while preserving order
    seen: set[tuple[str, str]] = set()
    unique: list[tuple[str, str]] = []
    for p in pairs:
        if p not in seen:
            seen.add(p)
            unique.append(p)

    # Ensure leadership trio from first row if missing
    have_ext = {e for _, e in unique}
    for title, ext in (("CEO", "1510"), ("COO", "1520"), ("CFO", "1560")):
        if ext not in have_ext:
            unique.insert(0, (title, ext))

    entries = []
    for i, (name, ext) in enumerate(unique, start=1):
        person, designation, department = classify(name)
        entries.append(
            {
                "id": f"snhc-{i:03d}",
                "person": person,
                "designation": designation,
                "department": department,
                "floor": "G",
                "zone": "Zone A",
                "email": "",
                "mobile": "",
                "extension": ext,
                "updatedAt": "2026-08-25T00:00:00.000Z",
            }
        )

    OUT.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {OUT.name}")
    for e in entries:
        print(f"{e['extension']:>5}  {e['person']:<42} {e['designation']:<16} {e['department']}")


if __name__ == "__main__":
    main()
