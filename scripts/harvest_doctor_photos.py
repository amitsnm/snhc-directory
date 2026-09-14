"""Harvest doctor portrait URLs from public profile pages into doctors.ts."""
from __future__ import annotations

import re
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DOCTORS_TS = ROOT / "src" / "data" / "doctors.ts"
SITE = "https://nirankarihealthcity.org"

SKIP = ("logo", "favicon", "icon", "section-2-bg", "placeholder")


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")


def pick_photo(html: str) -> str | None:
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.I)
    candidates: list[str] = []
    for src in imgs:
        low = src.lower()
        if "wp-content/uploads" not in low:
            continue
        if any(s in low for s in SKIP):
            continue
        if not re.search(r"\.(jpe?g|png|webp)(?:\?|$)", low):
            continue
        if src.startswith("//"):
            src = "https:" + src
        elif src.startswith("/"):
            src = SITE + src
        # Prefer full-size names without size suffix when available later
        candidates.append(src)

    if not candidates:
        return None

    # Prefer 1024x1024 or original (no -NNNxNNN) doctor portraits
    scored: list[tuple[int, str]] = []
    for src in candidates:
        score = 0
        name = src.rsplit("/", 1)[-1].lower()
        if re.search(r"-1024x1024\.(jpe?g|png|webp)$", name):
            score += 50
        elif not re.search(r"-\d+x\d+\.(jpe?g|png|webp)$", name):
            score += 40
        elif re.search(r"-300x300\.(jpe?g|png|webp)$", name):
            score += 20
        if name.startswith("dr-") or "dr-" in name:
            score += 10
        scored.append((score, src))
    scored.sort(key=lambda x: (-x[0], x[1]))
    return scored[0][1]


def main() -> None:
    text = DOCTORS_TS.read_text(encoding="utf-8")
    paths = re.findall(r"profilePath:\s*'([^']+)'", text)
    mapping: dict[str, str] = {}
    for path in paths:
        url = SITE + path
        try:
            html = fetch(url)
            photo = pick_photo(html)
            print(path, "->", photo or "NONE")
            if photo:
                mapping[path] = photo
        except Exception as exc:  # noqa: BLE001
            print(path, "ERROR", exc)

    # Inject photoUrl field after profilePath if missing
    def inject(match: re.Match[str]) -> str:
        block = match.group(0)
        path_m = re.search(r"profilePath:\s*'([^']+)'", block)
        if not path_m:
            return block
        path = path_m.group(1)
        photo = mapping.get(path)
        if not photo:
            return block
        if "photoUrl:" in block:
            return re.sub(r"photoUrl:\s*'[^']*'", f"photoUrl: '{photo}'", block)
        return block.replace(
            f"profilePath: '{path}'",
            f"profilePath: '{path}', photoUrl: '{photo}'",
        )

    # Match each doctor object roughly
    updated = re.sub(
        r"\{\s*name:[\s\S]*?bookAppointment:\s*(?:true|false)\s*\}",
        inject,
        text,
    )

    # Ensure interface has photoUrl
    if "photoUrl?:" not in updated and "photoUrl:" not in updated.split("export interface Doctor")[1].split("}")[0]:
        updated = updated.replace(
            "profilePath: string\n",
            "profilePath: string\n  photoUrl?: string\n",
        )

    DOCTORS_TS.write_text(updated, encoding="utf-8")
    print("Updated", DOCTORS_TS, "photos:", len(mapping))


if __name__ == "__main__":
    main()
