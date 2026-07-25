"""8e.7 regression guard for import preset, measurements, and schema-3 persistence."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'templates'/'index.html').read_text(encoding='utf-8')
JS=(ROOT/'static'/'viewer.js').read_text(encoding='utf-8')
for marker in ('id="calibrateScaleTool"','id="measureDistanceTool"','id="clearMeasurements"','id="measurementStatus"','value="hvdcMm"','HVDC / mm (-90 X, 0.01)'):
    assert marker in HTML, f'Missing 8e.7 control: {marker}'
for marker in ("const PROJECT_SCHEMA_VERSION = 3;","function beginMeasurementTool(mode)","function pickMeasurementPoint(event)","function completeMeasurement()","measurements: measurements.map(record => ({","restoreMeasurements(project.measurements)","item.object.scale.multiplyScalar(factor)","importScale = 0.01","model.rotation.x = -Math.PI / 2","referenceImages: sceneObjects","workspace: {","preferences: { ...preferences }"):
    assert marker in JS, f'Missing 8e.7 behavior: {marker}'
assert JS.index("preferences.modelImportPreset === 'hvdcMm'") < JS.index('model.scale.multiplyScalar(importScale)')
print('8e.7 measurement/import/persistence guard passed')