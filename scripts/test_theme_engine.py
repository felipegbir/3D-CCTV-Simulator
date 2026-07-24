"""Regression checks for the 8e.3 CSS-variable theme engine."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "static" / "viewer.js").read_text(encoding="utf-8")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    require('body data-theme="dark"' in HTML, "Dark theme must be the 8e.5 document default")
    require('body[data-theme="dark"]' in HTML, "Dark theme variable override is missing")
    require('id="toggleTheme"' in HTML, "Theme toggle control is missing")
    require('aria-pressed="true"' in HTML, "Theme toggle needs the dark-default accessible state")

    declared = set(re.findall(r"(--[a-z0-9-]+)\s*:", HTML))
    required_variables = {
        "--page-bg",
        "--sidebar-bg",
        "--panel-bg",
        "--panel-title-bg",
        "--text",
        "--control-bg",
        "--toolbar-bg",
        "--inspector-bg",
        "--viewport-frame-bg",
        "--viewport-panel-bg",
    }
    require(required_variables <= declared, "Required theme variables are incomplete")

    required_js = (
        "function applyTheme(theme)",
        "document.body.dataset.theme = normalizedTheme",
        "scene.background.set(isDark ? 0x11161c : 0xf2f2f2)",
        "toggleThemeButton.addEventListener('click'",
        "toggleThemeButton.setAttribute('aria-pressed', String(isDark))",
    )
    require(re.search(r"const APP_VERSION = '8e\.\d+';", JS) is not None,
            "Missing compatible app version marker")
    for marker in required_js:
        require(marker in JS, f"Missing theme behavior: {marker}")

    require("applyTheme(preferences.theme)" in JS,
            "The 8e.3 theme engine must remain connected to current preferences")
    print(f"Theme variables: {len(declared)}")
    print("8e.3 theme regression checks passed")


if __name__ == "__main__":
    main()