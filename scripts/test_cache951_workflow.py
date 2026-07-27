from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / "templates" / "index.html").read_text(encoding="utf-8")
js = (root / "static" / "viewer.js").read_text(encoding="utf-8")

for marker in (
    "const PROJECT_SCHEMA_VERSION = 7;",
    "projectDownloadExtension = 'nmd'",
    "function beginPresetRoiCreation",
    "attachPresetRoiDrawing",
    "pixelWidth:",
    "pixelHeight:",
    "Preferred/enhanced 9 x 9 or greater",
    "Minimum detection 3 x 3",
    "presetsBtn.style.display = 'none'",
    "presetsBtn.style.display = 'inline-block'",
    "function addBoxObject()",
    "function copySelectedObject()",
    "function pasteSceneObject()",
):
    assert marker in js, f"Missing cache 951 workflow marker: {marker}"

for marker in (
    "/static/viewer.js?v=957",
    'accept=".nmd,.json,application/json"',
    'id="editCopy"',
    'id="viewFitGrid"',
    'id="objectLock"',
    ".preset-roi-overlay",
):
    assert marker in html, f"Missing cache 951 UI marker: {marker}"

assert "menu-button disabled" not in "\n".join(
    line for line in html.splitlines()
    if any(label in line for label in ("Close Project", "Copy", "Zoom Out", "Add Object"))
)
print("cache 951 .nmd, menu, maximized-Presets, and ROI workflow guard passed")


