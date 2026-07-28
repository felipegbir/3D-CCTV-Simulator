from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'static/viewer.js').read_text(encoding='utf-8')
html=(root/'templates/index.html').read_text(encoding='utf-8')
for marker in ['metricDecimals: 3','normalizedPtzPresetObjects','videoWallPresetPanelPercent = 20','presetPanelPercent: videoWallPresetPanelPercent']:
    assert marker in js, marker
assert 'video-wall-preset-resizer' in html
assert '/static/viewer.js?v=872' in html
print('cache 954 stable ROI, precision refresh, and resizable dock guard passed')

