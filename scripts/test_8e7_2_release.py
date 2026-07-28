"""8e.7.2 release, exact dock sizing, and HTML user-guide guard."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'templates' / 'index.html').read_text(encoding='utf-8')
JS = (ROOT / 'static' / 'viewer.js').read_text(encoding='utf-8')
GUIDE = (ROOT / 'static' / 'user-guide.html').read_text(encoding='utf-8')
RELEASE = (ROOT / 'releases' / '8e.7.2.md').read_text(encoding='utf-8')
assert "const APP_VERSION = '8e.7.2';" in JS
for marker in ('N.O.M.A.D. CCTV Digital Twin Simulator 8e.7.2','id="appVersionLabel">8e.7.2','id="menuVersionLabel">8e.7.2','href="/static/user-guide.html"','id="openUserGuide"','/static/viewer.js?v=872'):
    assert marker in HTML, marker
camera_dock = HTML.split('.camera-viewport .ptz-preset-panel {',1)[1].split('}',1)[0]
for marker in ('height: 100%;','max-height: 100%;','box-sizing: border-box;'):
    assert marker in camera_dock, marker
for marker in ('Version 8e.7.2','id="projects"','id="cameras"','id="ptz"','id="roi"','id="measure"','id="wall"','id="reports"','Lay Face Flat remains experimental'):
    assert marker in GUIDE, marker
assert '8e.7.2 closes the accepted 8e.7.1 correction programme' in RELEASE
print('8e.7.2 release, dock-size, and user-guide guard passed')