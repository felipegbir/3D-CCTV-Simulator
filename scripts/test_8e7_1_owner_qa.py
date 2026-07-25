"""8e.7.1 owner-QA regression guard for layout, persistence, and preset lifecycle."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'templates' / 'index.html').read_text(encoding='utf-8')
JS = (ROOT / 'static' / 'viewer.js').read_text(encoding='utf-8')

for marker in (
    'sceneTreeToggle',
    'body.scene-tree-collapsed #viewer',
    '#operationsFrame .menu-group.open',
    '#operationsFrame .menu-group > .menu-dropdown',
    "dropdown.className = 'menu-dropdown'",
    "dropdown.setAttribute('role', 'menu')",
    "if (!event.target.closest('#operationsFrame .menu-group')) closeMenus();",
    "event.target.matches('select, input:not([type=\"range\"])')",
    '.camera-viewport.has-preset-dock .camera-viewport-body',
    '.ptz-preset-list option.limit-warning',
    'preset-depth-pick-banner',
    '/static/viewer.js?v=942',
):
    assert marker in HTML, f'Missing owner-QA layout marker: {marker}'

for marker in (
    'function calculatePtzRecallDurationMs',
    'function refreshCameraPresetDerivedData',
    'function invalidateActivePtzPreset',
    'activePtzPresetId = null',
    'function beginPresetDepthSelection',
    'preset.depthTarget = { ...depthTarget }',
    'preset.projectionDistance = distance',
    'ptzPresetPanel.refreshDerived',
    'const updateMetadataPreview = () =>',
    'retainedPresets',
    "option.style.color = '#ff3b3b'",
    'setTimeout(() => URL.revokeObjectURL(url), 1000)',
    'hiddenReticleObjects',
    "if (item.type === 'camera') invalidateActivePtzPreset",
):
    assert marker in JS, f'Missing owner-QA behavior marker: {marker}'

assert 'item.data = newData;' not in JS
assert 'Math.max(400, angularTravel / speed' not in JS
print('8e.7.1 owner-QA layout/persistence/preset lifecycle guard passed')
