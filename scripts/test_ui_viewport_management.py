"""Regression guard for N.O.M.A.D. 8e.6 professional UI and viewport management."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "static" / "viewer.js").read_text(encoding="utf-8")

required_html = (
    "N.O.M.A.D. CCTV Digital Twin Simulator 8e.6",
    'id="appVersionLabel"',
    'id="arrangeCameraWall"',
    'id="aboutPanel"',
    'id="aboutVersion"',
    "All rights reserved.",
    "felipe.gomez@live.ca",
    "https://threejs.org/",
    "https://flask.palletsprojects.com/en/stable/",
    "https://www.python.org/",
    "https://esm.sh/",
    "Source repository: publication link pending.",
    "/static/viewer.js?v=923",
)
for marker in required_html:
    assert marker in HTML, f"Missing 8e.6 UI marker: {marker}"

required_js = (
    "const APP_VERSION = '8e.6';",
    "const MAX_CAMERA_VIEWPORTS = 16;",
    "function focusCameraViewport(viewport)",
    "function getCameraWallDimension(count)",
    "function arrangeCameraViewports()",
    "record.applyWallLayout({",
    "function applyWallLayout(rect)",
    "arrangeCameraWallButton.addEventListener('click', arrangeCameraViewports)",
    "viewport.addEventListener('mousedown', () => focusCameraViewport(viewport), true)",
    "if (viewportRecord) focusCameraViewport(viewportRecord.element)",
    "focusCameraViewport(viewport);\n    isMaximized = !isMaximized",
    "isRenderable: () => !isMinimized",
    "openCameraViewports[index].renderer.dispose()",
)
for marker in required_js:
    assert marker in JS, f"Missing 8e.6 viewport marker: {marker}"

assert JS.count("if (viewportRecord) focusCameraViewport(viewportRecord.element)") == 1, (
    "Camera-selection focus logic must exist only in selectObject"
)
assert "Maximum of two Camera Viewports" not in JS

print("8e.6 professional UI and viewport-management source guard passed")