from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'static/viewer.js').read_text(encoding='utf-8')
html=(root/'templates/index.html').read_text(encoding='utf-8')
for marker in ["window.addEventListener('pointermove',move)","editingPresetRoiId===roi?.id?null","selected preset and ROIs are retained for comparison","formatMetric(preset.roi.width)","record.sourceKey === 'scene' ? width / height"]: assert marker in js, marker
assert '/static/viewer.js?v=956' in html
print('cache 955 ROI editing, retention, precision, and sensor-aspect guard passed')
