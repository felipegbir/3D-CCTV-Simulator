"""Cache 959 attached preset dock, Video Wall host, and rail parity guard."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'templates' / 'index.html').read_text(encoding='utf-8')
JS = (ROOT / 'static' / 'viewer.js').read_text(encoding='utf-8')
for marker in (
    '/* The preset manager is an attached sibling dock and never consumes sensor-pane space. */',
    '.camera-viewport.has-preset-dock { overflow: visible; }',
    'left: 100%;',
    'max-width: none;',
    '.video-wall-tile {\n      position: relative;',
    '.video-wall-render-pane { position: relative; flex: 1 1 100%; width: 100%;',
    '#sceneFrame {\n      flex: 1 1 auto;',
    'border-radius: 0;',
    'box-shadow: none;',
    '/static/viewer.js?v=874',
): assert marker in HTML, marker
for marker in (
    "body.style.display = 'flex';",
    'const sensorAspect = (Number(cameraItem.data?.resolutionWidth) || 1920)',
    'const frameAspect = 320 / 240;',
    '.video-wall-render-pane{position:relative;flex:1 1 100%;width:100%;',
): assert marker in JS, marker
assert 'baseWidth + 360' not in JS
assert 'Temporary debug line' not in JS
print('cache 959 attached-dock, Video Wall, and rail-parity guard passed')