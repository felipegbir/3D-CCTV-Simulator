"""Source regression guard for the N.O.M.A.D. 8e.4 preferences contract."""

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "static" / "viewer.js").read_text(encoding="utf-8")

PREFERENCE_IDS = (
    "preferenceTheme",
    "preferenceReversePan",
    "preferenceReverseTilt",
    "preferenceInvertZoom",
    "preferenceRendererQuality",
    "preferenceShowGrid",
    "preferenceShowAxes",
    "preferenceConeOpacity",
    "preferenceConeOpacityValue",
    "preferenceFbxAutoScale",
    "resetPreferences",
)

for element_id in PREFERENCE_IDS:
    assert f'id="{element_id}"' in HTML, f"Missing preference control: {element_id}"
    assert f"getElementById('{element_id}')" in JS, f"Unwired preference: {element_id}"

REQUIRED_RUNTIME = (
    "const PREFERENCES_STORAGE_KEY = 'nomadCctvPreferences.v1';",
    "function sanitizePreferences(candidate)",
    "function loadPreferences()",
    "function savePreferences()",
    "function applyPreferences({ persist = false } = {})",
    "window.localStorage.getItem(PREFERENCES_STORAGE_KEY)",
    "window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))",
    "gridHelper.visible = preferences.showGrid",
    "axesHelper.visible = preferences.showAxes",
    "preferences.reversePan ? -1 : 1",
    "preferences.reverseTilt ? -1 : 1",
    "preferences.invertZoom ? -wheelDirection : wheelDirection",
    "opacity: preferences.coneOpacity",
    "preferences.fbxAutoScale && sourceFormat === 'fbx'",
    "configureRendererQuality(renderer)",
)

assert re.search(r"const APP_VERSION = '8e\.\d+';", JS), "Missing app version"
assert "theme: 'dark'" in JS, "Dark must be the new/reset preference default"

for marker in REQUIRED_RUNTIME:
    assert marker in JS, f"Missing preference behavior: {marker}"

assert "preferences" not in JS[JS.index("const project = {"):JS.index("const blob =", JS.index("const project = {"))], (
    "8e.4 browser preferences must not silently expand the schema-2 project JSON"
)

print("8e.4 preference source regression guard passed")