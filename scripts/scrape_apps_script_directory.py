"""Load SNHC Apps Script directory UI and dump getDirectoryData payload."""
from __future__ import annotations

import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = (
    "https://script.google.com/macros/s/"
    "AKfycbzySdeUADo7lWCGsuCANCYzMJ-pEMIKQywbUjz9zLP_giqNuyienmwsdW354uNeu7C8/exec"
)
OUT = Path(__file__).resolve().parents[1] / "src" / "data" / "apps-script-directory-raw.json"


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(URL, wait_until="domcontentloaded", timeout=120000)

        # Wait for sandbox iframe + data render
        data = None
        for _ in range(60):
            time.sleep(1)
            frames = page.frames
            for frame in frames:
                try:
                    data = frame.evaluate(
                        """() => {
                          if (typeof MANAGEMENT === 'undefined') return null;
                          return {
                            management: MANAGEMENT,
                            staff: STAFF,
                            published: document.querySelector('#meta-row')?.innerText || '',
                            totalText: document.querySelector('#search-count')?.innerText || '',
                            mgmtCount: MANAGEMENT.length,
                            staffCount: STAFF.length,
                          };
                        }"""
                    )
                except Exception:
                    continue
                if data and (data.get("mgmtCount") or data.get("staffCount")):
                    break
            if data and (data.get("mgmtCount") or data.get("staffCount")):
                break

        browser.close()

    if not data:
        raise SystemExit("Failed to extract directory data from Apps Script page")

    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Wrote", OUT)
    print("management", data.get("mgmtCount"), "staff", data.get("staffCount"))
    print("meta", data.get("published"))
    print("sample mgmt", (data.get("management") or [])[:3])
    print("sample staff", (data.get("staff") or [])[:3])


if __name__ == "__main__":
    main()
