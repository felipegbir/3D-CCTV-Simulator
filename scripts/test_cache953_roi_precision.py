from pathlib import Path
root=Path(__file__).resolve().parents[1]
js=(root/'static/viewer.js').read_text(encoding='utf-8')
html=(root/'templates/index.html').read_text(encoding='utf-8')
for marker in ["metricDecimals: 3","preferenceMetricDecimals","function formatMetric","function beginPresetRoiCreation","data-action=\"roi-add\"","data-action=\"roi-edit\"","data-action=\"roi-delete\"","Use Add ROI to draw one or more regions","presetDockVertical: layout.columns === 1 && layout.rows === 1"]:
    assert marker in js, f'Missing cache 953 marker: {marker}'
for marker in ["id=\"preferenceMetricDecimals\"","preset-dock-vertical","/static/viewer.js?v=957"]:
    assert marker in html, f'Missing cache 953 UI marker: {marker}'
print('cache 953 detached ROI, precision, and 1x1 dock guard passed')
