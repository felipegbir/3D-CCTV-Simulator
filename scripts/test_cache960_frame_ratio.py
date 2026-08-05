"""Cache 960 permanent Camera View frame ratio and right-dock guard."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'templates' / 'index.html').read_text(encoding='utf-8')
JS = (ROOT / 'static' / 'viewer.js').read_text(encoding='utf-8')
assert JS.count('const frameAspect = 320 / 240;') == 2
assert JS.count('let frameHeight = frameWidth / frameAspect;') == 2
assert JS.count("viewport.style.width = `${Math.floor(frameWidth)}px`;") == 2
assert JS.count("viewport.style.height = `${Math.floor(frameHeight)}px`;") == 2
assert 'bodyHeight + headerHeight' not in JS
assert 'containerRect.height * 0.68)}px' not in JS
vertical = '.video-wall-tile.preset-dock-vertical .ptz-preset-panel { position: absolute; z-index: 20; left: auto; right: 0; top: 0; bottom: auto;'
assert vertical in HTML
assert '/static/viewer.js?v=875' in HTML
print('cache 960 fixed 4:3 Camera View and exclusive right-dock guard passed')