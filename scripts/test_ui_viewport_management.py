"""Regression guard for 8e.7 UI, floating viewports, and true-grid Video Wall."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'templates'/'index.html').read_text(encoding='utf-8')
JS=(ROOT/'static'/'viewer.js').read_text(encoding='utf-8')
for marker in ('N.O.M.A.D. CCTV Digital Twin Simulator 8e.7','id="appVersionLabel"','id="openVideoWall"','id="popOutVideoWall"','id="videoWallOverlay"','id="videoWallGrid"','video-wall-empty-slot','--wall-rows','id="helpGroup"','id="aboutGroup"','All rights reserved.','/static/viewer.js?v=934'):
    assert marker in HTML, f'Missing 8e.7 UI marker: {marker}'
for marker in ("const APP_VERSION = '8e.7';","const MAX_CAMERA_VIEWPORTS = 16;","function focusCameraViewport(viewport)","function buildIntegratedVideoWall()","function buildPopupVideoWall()","function getVideoWallLayout(count, selection)","function appendVideoWallEmptySlots(doc, grid, count)","function reorderVideoWall(draggedKey, targetKey)","key: 'scene', label: 'Planning Scene'","viewport.addEventListener('mousedown', () => focusCameraViewport(viewport), true)","isRenderable: () => !isMinimized","openCameraViewports[index].renderer.dispose()","wallRenderer.forceContextLoss?.()","openCameraViewports[index].renderer.forceContextLoss?.()"):
    assert marker in JS, f'Missing 8e.7 viewport marker: {marker}'
assert 'arrangeCameraViewports' not in JS
assert 'cameraWallLayoutActive' not in JS
print('8e.7 true-grid UI and viewport-management guard passed')