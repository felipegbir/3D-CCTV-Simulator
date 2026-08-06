from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / "templates" / "index.html").read_text(encoding="utf-8")
js = (root / "static" / "viewer.js").read_text(encoding="utf-8")

for marker in (
    "const PROJECT_SCHEMA_VERSION = 8;",
    "selectedObjectId: selectedId",
    "sceneTreeCollapsed:",
    "objectInspectorCollapsed:",
    "sceneTreeGroups:",
    "selectedTileIndex: selectedVideoWallTileIndex",
    "ptzEnabledSources: Object.fromEntries(videoWallPtzEnabledBySource)",
    "project.workspace?.selectedObjectId",
    "videoWallPtzEnabledBySource.clear()",
    "project.workspace?.mode === 'videoWall'",
    "getNextPtzPresetName",
    "padStart(3, '0')",
):
    assert marker in js, f"Missing cache 950 workspace/preset marker: {marker}"

for marker in (
    "/static/viewer.js?v=",
    "#operationsFrame::after",
    "z-index: 30001",
    "isolation: isolate",
    ".video-wall-render-pane { position: absolute; inset: 0;",
    "height: 40%; max-height: 40%;",
    "#sceneFrame .panel-content",
):
    assert marker in html, f"Missing cache 950 UI marker: {marker}"

assert "inset 0 -1px 0 var(--border-strong)" not in html
print("cache 950 workspace, naming, stacking, and UI guard passed")
