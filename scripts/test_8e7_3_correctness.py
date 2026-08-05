"""8e.7.3 camera identity, optical geometry, and report-view regression guard."""

import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = (ROOT / "static" / "viewer.js").read_text(encoding="utf-8")
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
GUIDE = (ROOT / "static" / "user-guide.html").read_text(encoding="utf-8")

assert "const APP_VERSION = '8e.7.3';" in JS
for marker in (
    "N.O.M.A.D. CCTV Digital Twin Simulator 8e.7.3",
    'id="appVersionLabel">8e.7.3',
    'id="menuVersionLabel">8e.7.3',
    "/static/viewer.js?v=873",
):
    assert marker in HTML, marker
assert "Version 8e.7.3" in GUIDE

create_start = JS.index("function createCameraObject")
create_end = JS.index("// Load model", create_start)
create_block = JS[create_start:create_end]
assert "explicitId = null" in create_block
assert "const id = resolveCameraObjectId(explicitId);" in create_block
assert "cameraCounter += 1" not in create_block
assert "function registerCameraId(cameraId)" in JS
assert "function resolveLoadedCameraId(rawId, claimedIds, cameraIndex, warnings)" in JS

load_start = JS.index("function applyLoadedProject(project)")
load_end = JS.index("loadProjectFile.addEventListener", load_start)
load_block = JS[load_start:load_end]
for marker in (
    "const restoredId = resolveLoadedCameraId(cameraData.id",
    "new THREE.Vector3(0, 2, 0),\n          restoredId",
    "item.name = cameraData.name || item.name;",
    "refreshCameraPresetDerivedData(item);",
):
    assert marker in load_block, marker
assert "sceneObjects.find(o => o.name === cameraData.name)" not in load_block
assert load_block.index("project.cameras.forEach") < load_block.index("if (cameraIdWarnings.length)")
assert load_block.index("  });\n\n  if (cameraIdWarnings.length)") >= 0

for marker in (
    "function computeVerticalFovDegrees(horizontalFovDegrees, resolutionWidth, resolutionHeight)",
    "2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(horizontalFov) / 2) / aspect)",
    "const vfov = computeVerticalFovDegrees(hfov, resolutionWidth, resolutionHeight);",
    "renderCamera.fov = currentVfov;",
    "renderCamera.aspect = resolutionWidth / resolutionHeight;",
    "new THREE.PerspectiveCamera(source.fov, source.aspect",
):
    assert marker in JS, marker
for stale in ("hfov * 9 / 16", "vfov: 67.5", "vfov: 50", "renderCamera.fov = currentHfov"):
    assert stale not in JS, stale


def vfov(hfov_degrees, width, height):
    return math.degrees(2 * math.atan(math.tan(math.radians(hfov_degrees) / 2) / (width / height)))

assert math.isclose(vfov(90, 1920, 1080), 58.71550708558255, rel_tol=0, abs_tol=1e-10)
assert math.isclose(vfov(90, 640, 480), 73.73979529168804, rel_tol=0, abs_tol=1e-10)
assert math.isclose(vfov(60, 1024, 1024), 60.0, rel_tol=0, abs_tol=1e-10)

for marker in (
    "function getReportSceneBounds()",
    "function clampReportTargetAboveFloor(target, bounds)",
    "function ensureAboveGroundReportPosition(position, target, bounds)",
    "safePosition.y = Math.max(safePosition.y, floorY + clearance, target.y + clearance);",
    "oppositePosition.y = primaryPosition.y;",
):
    assert marker in JS, marker
assert "target.clone().sub(offset)" not in JS
assert "Overview, opposite-side, and camera-context viewpoints are kept above the grid" in GUIDE

print("8e.7.3 camera identity, optical geometry, and report-view guard passed")