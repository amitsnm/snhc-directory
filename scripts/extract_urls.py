import re
from pathlib import Path

t = Path(r"C:/Users/IT/AppData/Local/Temp/snhc-dir2.txt").read_text(encoding="utf-8", errors="replace")
urls = re.findall(r"https:\\?/\\?/[^\"'\\s]+", t)
seen = set()
for u in urls:
    u = u.replace("\\/", "/")
    if u in seen:
        continue
    seen.add(u)
    if any(x in u for x in ("usercontent", "exec", "google", "drive")):
        print(u[:400])
