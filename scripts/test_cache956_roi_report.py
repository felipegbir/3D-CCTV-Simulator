from pathlib import Path
root = Path(__file__).resolve().parents[1]
js = (root / 'static/viewer.js').read_text(encoding='utf-8')
html = (root / 'templates/index.html').read_text(encoding='utf-8')
for marker in [
    "analysisBox.textContent=formatPresetRoiAnalysis(roi)",
    "class=\"ptz-roi-analysis\"",
    "position:absolute;inset:0",
    "captureReportSceneViews",
    "openReportConfiguration",
    "includeOppositeView",
    "includeCameraContext",
    "imageQuality",
]:
    assert marker in js or marker in html, marker
assert 'pixels ?' not in js
assert '/static/viewer.js?v=956' in html
print('cache 956 live ROI analysis, fixed camera canvas, typography, and report configuration guard passed')