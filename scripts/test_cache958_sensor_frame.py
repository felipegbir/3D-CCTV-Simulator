"""Cache 958 immutable sensor frame, ROI lifecycle, navigation, and clone guard."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
JS = (ROOT / 'static' / 'viewer.js').read_text(encoding='utf-8')
HTML = (ROOT / 'templates' / 'index.html').read_text(encoding='utf-8')
for marker in (
    'cameraItem.data.activePtzPresetId = null;',
    'cameraItem.data.userConfigured = true;',
    'requestAnimationFrame(() => requestAnimationFrame(() => refreshPresetRoiOverlays(cameraItem)))',
    'position: cameraItem.object.position.clone()',
    'function captureReportFrameWithRois',
    'ctx.drawImage(sourceCanvas',
    'const clonedRoot = createCameraObject',
    'entry.object === clonedRoot',
    'function resizePlanningRenderer()',
    'new ResizeObserver(settleAllRendererSizes).observe(container)',
    "sceneNavigationCube.querySelectorAll('[data-view]')",
):
    assert marker in JS, marker
for forbidden in ('baseWidth + 360', "cameraItem.data.activePtzPresetId = preset.id;\n  if (ptzPresetPanel)"):
    assert forbidden not in JS, forbidden
assert '.video-wall-render-pane { position: absolute; inset: 0; width: 100%; height: 100%' in HTML
assert '.nav-face-top{transform:rotateX(-90deg)' in HTML
print('cache 958 immutable sensor frame/ROI/navigation/clone guard passed')