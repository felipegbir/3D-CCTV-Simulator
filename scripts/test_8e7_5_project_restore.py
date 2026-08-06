"""8e.7.5 model-source restoration and consolidated-menu regression guard."""

from pathlib import Path

root = Path(__file__).resolve().parents[1]
js = (root / "static" / "viewer.js").read_text(encoding="utf-8")
html = (root / "templates" / "index.html").read_text(encoding="utf-8")
guide = (root / "static" / "user-guide.html").read_text(encoding="utf-8")

for marker in (
    "const APP_VERSION = '8e.7.5';",
    "const PROJECT_SCHEMA_VERSION = 8;",
    "let sceneLoadGeneration = 0;",
    "function getModelSourceDescriptor(item)",
    "function resolveSavedModelSource(project, modelData, index)",
    "function getProjectReplacementItems(project)",
    "function confirmProjectReplacement(items)",
    "function removeSceneItem(item)",
    "function loadSavedModelSource(source)",
    "async function prepareProjectModelRestorations(project, generation)",
    "async function applyLoadedProject(project)",
    "source: getModelSourceDescriptor(item)",
    "path: source.path",
    "route: source.route",
    "storage: source.storage",
    "const replacementItems = getProjectReplacementItems(project);",
    "if (!confirmProjectReplacement(replacementItems)) return false;",
    "replacementItems.forEach(removeSceneItem);",
    "await applyLoadedProject(project);",
    "const starterModelGeneration = sceneLoadGeneration;",
    "if (starterModelGeneration !== sceneLoadGeneration)",
):
    assert marker in js, f"Missing 8e.7.5 project restore marker: {marker}"

assert js.index("if (!confirmProjectReplacement(replacementItems)) return false;") < js.index("sceneLoadGeneration += 1;")
assert js.index("const restoration = await prepareProjectModelRestorations") < js.index("replacementItems.forEach(removeSceneItem);")

for element_id in ("saveAsProject", "uploadProject", "editAdd", "viewFitGrid", "viewToggleGrid", "viewToggleAxes"):
    assert f'id="{element_id}"' not in html, f"Redundant menu item remains: {element_id}"

for marker in (
    'id="loadProject"', 'id="closeProject"', 'id="saveProject"',
    'id="importModel"', 'id="importReferenceImage"', 'id="exportProject"',
    'id="viewZoomIn"', 'id="viewZoomOut"', 'id="resetView"',
    '>Rename Selected<', '>Show in Inspector<', '>Lock / Unlock Transform<',
    '/static/viewer.js?v=875',
):
    assert marker in html, f"Missing consolidated menu marker: {marker}"

for marker in (
    "Version 8e.7.5", "Export Project JSON", "server model library by file name",
    "Lock / Unlock Transform", "Grid and axes visibility are controlled only",
):
    assert marker in guide, f"Missing 8e.7.5 guide marker: {marker}"

print("8e.7.5 model-source restore and menu regression guard passed")