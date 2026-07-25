"""Renderer-quality parity regression guard."""
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'templates'/'index.html').read_text(encoding='utf-8')
JS=(ROOT/'static'/'viewer.js').read_text(encoding='utf-8')
for marker in ('body data-theme="dark"','.menu-group.collapsed .preference-row','id="preferenceTheme"'):
    assert marker in HTML
assert re.search(r'/static/viewer\.js\?v=\d+',HTML)
for marker in ("theme: 'dark'","targetRenderer.outputColorSpace = renderer.outputColorSpace","targetRenderer.toneMapping = renderer.toneMapping","targetRenderer.toneMappingExposure = renderer.toneMappingExposure","targetRenderer.shadowMap.enabled = preferences.rendererQuality !== 'performance'","configureRendererQuality(viewportRenderer)","configureRendererQuality(wallRenderer)","powerPreference: 'high-performance'"):
    assert marker in JS, f'Missing renderer contract: {marker}'
print('Renderer-parity guard passed')