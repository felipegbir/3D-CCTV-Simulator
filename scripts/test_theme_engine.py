"""Regression checks for the CSS-variable theme engine."""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "static" / "viewer.js").read_text(encoding="utf-8")
assert 'body data-theme="dark"' in HTML
assert 'body[data-theme="dark"]' in HTML
assert 'id="preferenceTheme"' in HTML
assert 'id="toggleTheme"' not in HTML, "Redundant View-menu theme toggle returned"
declared=set(re.findall(r"(--[a-z0-9-]+)\s*:",HTML))
assert {"--page-bg","--sidebar-bg","--panel-bg","--text","--control-bg","--toolbar-bg","--viewport-frame-bg"} <= declared
for marker in ("function applyTheme(theme)","document.body.dataset.theme = normalizedTheme","scene.background.set(isDark ? 0x11161c : 0xf2f2f2)","applyTheme(preferences.theme)"):
    assert marker in JS, f"Missing theme behavior: {marker}"
print("Theme regression checks passed")