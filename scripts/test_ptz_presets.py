"""8e.7.1 regression guard for PTZ preset CRUD, animation, and persistence."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'templates'/'index.html').read_text(encoding='utf-8')
JS=(ROOT/'static'/'viewer.js').read_text(encoding='utf-8')
for marker in ('N.O.M.A.D. CCTV Digital Twin Simulator 8e.7.1','ptz-preset-panel','/static/viewer.js?v='):
    assert marker in HTML, f'Missing 8e.7.1 preset UI marker: {marker}'
for marker in (
    "const APP_VERSION = '8e.7.1';",
    'const PROJECT_SCHEMA_VERSION = 5;',
    'ptzPresetSpeed: 10',
    'Math.min(60, Math.max(1, ptzPresetSpeed))',
    'function normalizePtzPreset(preset, index = 0)',
    'function ensureCameraPtzPresets(cameraItem)',
    'function captureCameraPreset(cameraItem, existing = {})',
    'function recallPtzPreset(cameraItem, preset)',
    'function updatePtzPresetAnimations(now)',
    'function openPtzPresetPanel(cameraItem, viewportElement = null)',
    'function cancelCameraPresetAnimation(cameraItem',
    'const reverseForPointSequence = firstScreenX > secondScreenX',
    'item.data.ptzPresets = (cameraData.data?.ptzPresets || cameraData.ptzPresets || []).map(normalizePtzPreset)',
    'updatePtzPresetAnimations(performance.now())',
    'Manage PTZ Presets',
    'Add Current',
    'Update Current',
    'data-action="delete"',
    'data-action="recall"',
    'data-action="save"',
    'Select Depth Surface',
    'thermographyClass',
    'cameraIdentity',
    'roiPixelsX',
    'ptzPresetsInspectorButton.addEventListener',
):
    assert marker in JS, f'Missing 8e.7.1 PTZ preset marker: {marker}'
assert 'presets.disabled = true' not in JS
assert JS.count('openPtzPresetPanel(') >= 3
print('8e.7.1 PTZ preset CRUD/animation/persistence guard passed')