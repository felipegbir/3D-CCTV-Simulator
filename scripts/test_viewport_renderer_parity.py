"""Regression guard for N.O.M.A.D. 8e.5 defaults, collapse, and renderer parity."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "static" / "viewer.js").read_text(encoding="utf-8")

required_html = (
    'body data-theme="dark"',
    '.menu-group.collapsed .preference-row',
    'id="toggleTheme" type="button" aria-pressed="true">Light Mode',
    '/static/viewer.js?v=922',
)
for marker in required_html:
    assert marker in HTML, f"Missing 8e.5 HTML contract: {marker}"

required_js = (
    "const APP_VERSION = '8e.5';",
    "theme: 'dark'",
    "targetRenderer.outputColorSpace = renderer.outputColorSpace",
    "targetRenderer.toneMapping = renderer.toneMapping",
    "targetRenderer.toneMappingExposure = renderer.toneMappingExposure",
    "targetRenderer.shadowMap.enabled = preferences.rendererQuality !== 'performance'",
    "targetRenderer.shadowMap.type = renderer.shadowMap.type",
    "configureRendererQuality(viewportRenderer)",
    "powerPreference: 'high-performance'",
)
for marker in required_js:
    assert marker in JS, f"Missing 8e.5 renderer/default contract: {marker}"

assert JS.index("body.appendChild(viewportRenderer.domElement)") < JS.index(
    "configureRendererQuality(viewportRenderer)"
), "Viewport renderer must be attached before its size is configured"

print("8e.5 dark-default, collapse, and renderer-parity guard passed")