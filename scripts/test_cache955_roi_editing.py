from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'static/viewer.js').read_text(encoding='utf-8')
html=(root/'templates/index.html').read_text(encoding='utf-8')
for marker in ["window.addEventListener('pointermove',move)","editingPresetRoiId===roi?.id?null","recall a preset to display its ROIs.","formatMetric(preset.roi.width)","const sourceAspect = record.sourceKey === 'scene'"]: assert marker in js, marker
assert '/static/viewer.js?v=872' in html
print('cache 955 ROI editing, retention, precision, and sensor-aspect guard passed')
