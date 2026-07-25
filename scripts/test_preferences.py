"""Regression guard for N.O.M.A.D. preferences and 8e.7 persistence."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "static" / "viewer.js").read_text(encoding="utf-8")
ids = ("preferenceTheme","preferenceReversePan","preferenceReverseTilt","preferenceInvertZoom","preferenceRendererQuality","preferenceShowGrid","preferenceShowAxes","preferenceConeOpacity","preferenceConeOpacityValue","preferenceFbxAutoScale","preferenceModelImportPreset","resetPreferences")
for element_id in ids:
    assert f'id="{element_id}"' in HTML, f"Missing preference control: {element_id}"
    assert f"getElementById('{element_id}')" in JS, f"Unwired preference: {element_id}"
markers = ("const PREFERENCES_STORAGE_KEY = 'nomadCctvPreferences.v1';","function sanitizePreferences(candidate)","function applyPreferences({ persist = false } = {})","theme: 'dark'","modelImportPreset: 'hvdcMm'","preferences.modelImportPreset === 'hvdcMm'","preferences: { ...preferences }","gridHelper.visible = preferences.showGrid","preferences.reversePan ? -1 : 1","preferences.reverseTilt ? -1 : 1","preferences.invertZoom ? -wheelDirection : wheelDirection","ptzPresetSpeed: 10","Math.min(60, Math.max(1, ptzPresetSpeed))")
for marker in markers: assert marker in JS, f"Missing preference behavior: {marker}"
print("8e.7.1 preference source regression guard passed")