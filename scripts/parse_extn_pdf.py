import fitz
import json
import re
import os
from collections import defaultdict

doc = fitz.open(r"c:\Users\IT\Downloads\Complex_Extn_List_as on 12_Feb_2026.pdf")
page = doc[0]
words = page.get_text("words")

COLS = [(0, 190), (190, 380), (380, 600)]


def col_of(x: float) -> int:
    for i, (a, b) in enumerate(COLS):
        if a <= x < b:
            return i
    return 2


lines: dict = defaultdict(lambda: [[], [], []])
for w in words:
    if w[1] < 60:
        continue
    if w[4] in ("DEPARTMENT", "INTERCOM") and w[1] < 70:
        continue
    y = round(w[1] / 2.5) * 2.5
    lines[y][col_of(w[0])].append(w)

SECTION_FLOORS = {
    "GROUND FLOOR": "G",
    "FIRST FLOOR": "1",
    "SECOND FLOOR": "2",
}

DEPT_KEYWORDS = (
    "PRESIDENT",
    "FINANCE",
    "PRACHAR",
    "CPAB",
    "FOREIGN",
    "MAGAZINE",
    "HRD",
    "SEWADAL",
    "SECRETARY",
    "MEDICAL",
    "LANGAR",
    "BLDG",
    "EDUCATION",
    "PURCHASE",
    "LEGAL",
    "SECURITY",
    "DESIGN",
    "STUDIO",
    "HH-",
    "INFORMATION",
    "MISCELLANEOUS",
    "GENERAL",
    "HH-RECEPTION",
)

entries = []
current_floor = "G"
current_dept = {"0": "General", "1": "General", "2": "General"}

for y in sorted(lines):
    row = lines[y]
    texts = []
    for ci in range(3):
        ws = sorted(row[ci], key=lambda w: w[0])
        t = " ".join(w[4] for w in ws).strip()
        t = t.replace("RaQesh", "Rakesh").replace("\x93", '"').replace("\x94", '"')
        texts.append(t)

    joined = " ".join(t for t in texts if t)
    for key, fl in SECTION_FLOORS.items():
        if key in joined.upper() and sum(1 for t in texts if t) <= 2:
            current_floor = fl

    for ci, t in enumerate(texts):
        if not t:
            continue
        m2 = re.search(r"(.*?)(\d{3,4})(?:\s*/\s*(\d{3,4}))?\s*$", t)
        if not m2:
            clean = re.sub(r"\s+(GROUND|FIRST|SECOND)\s+FLOOR.*", "", t, flags=re.I).strip()
            clean = re.sub(r"\s+MISCELLANEOUS.*", "", clean, flags=re.I).strip()
            up = clean.upper()
            if clean and any(k in up for k in DEPT_KEYWORDS):
                current_dept[str(ci)] = clean
            continue

        person = m2.group(1).strip(" -/")
        if not person:
            # lone extension under previous person — skip
            continue

        # Department header that also has people on same visual row handled separately
        up_person = person.upper()
        if any(k in up_person for k in DEPT_KEYWORDS) and "Ji" not in person and len(person.split()) <= 6:
            # e.g. "HRD / GEN ADMIN" shouldn't be a person; but "Magazine Helpline" is a desk
            if re.search(r"/\s*(GEN|PRACHAR|PUBLICATION|CANTEEN|LAND|SOCIAL)", up_person):
                current_dept[str(ci)] = person
                # still might have ext? rare
                continue

        dept = current_dept[str(ci)] or "General"
        floor = current_floor
        for ext in [m2.group(2)] + ([m2.group(3)] if m2.group(3) else []):
            entries.append(
                {
                    "person": person,
                    "extension": ext,
                    "department": dept,
                    "floor": floor,
                    "zone": "Zone A",
                    "designation": "",
                }
            )

seen = set()
uniq = []
for e in entries:
    k = (e["person"], e["extension"])
    if k in seen:
        continue
    seen.add(k)
    uniq.append(e)

print("COUNT", len(uniq))
for e in uniq[:20]:
    print(e)

os.makedirs(r"c:\Users\IT\Documents\dir\scripts", exist_ok=True)
out = r"c:\Users\IT\Documents\dir\scripts\parsed_extns.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(uniq, f, indent=2, ensure_ascii=False)
print("Wrote", out)
