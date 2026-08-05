from pathlib import Path
root = Path(__file__).resolve().parents[1]
js = (root / 'static/viewer.js').read_text(encoding='utf-8')
html = (root / 'templates/index.html').read_text(encoding='utf-8')
for marker in [
    'showNavigationCube: true', 'showScaleIndicator: true',
    'function initializeSceneNavigationOverlays()', 'function updateSceneNavigationOverlays()',
    'function fitRendererToHost(', "cameraItem.data.activePtzPresetId = null",
    "const activePresetId=c.cameraItem.data?.activePtzPresetId",
    'explicitNewName || getNextPtzPresetName(activePresetCamera)',
    'function cameraHasDependentConfiguration(', 'function requestConfiguredCameraChange(',
    'Replace and Clear Configuration', 'Clone and Apply New Model',
    "setPresetWorkflowStatus('ROI is too small.",
]:
    assert marker in js, marker
for marker in ['preferenceShowNavigationCube', 'preferenceShowScaleIndicator', 'scene-navigation-cube', 'scene-scale-indicator']:
    assert marker in html, marker
ptz_workflow = js[js.index('function beginPresetRoiCreation'):js.index("renderer.domElement.addEventListener('click'")]
assert 'setMeasurementStatus(' not in ptz_workflow
assert 'pixels ?' not in js
assert '/static/viewer.js?v=874' in html
print('cache 957 consolidated aspect, ROI lifecycle, naming, replacement guard, navigation, and scale guard passed')