import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../static/viewer.js', import.meta.url), 'utf8');
function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `Missing section ${startMarker}`);
  return source.slice(start, end);
}
const executable = [
  section('function getNextPtzPresetName', 'function calculatePolygonRoiMetrics'),
  section('function shortestAngleDelta', 'function applyAnimatedOpticalState'),
  'this.getNextPtzPresetName = getNextPtzPresetName;',
  'this.normalizePtzPreset = normalizePtzPreset;',
  'this.ensureCameraPtzPresets = ensureCameraPtzPresets;',
  'this.shortestAngleDelta = shortestAngleDelta;'
].join('\n');
const sandbox = {
  Date,
  THREE: { MathUtils: { clamp: (value, min, max) => Math.min(max, Math.max(min, value)) } }
};
vm.runInNewContext(executable, sandbox);
const normalized = JSON.parse(JSON.stringify(sandbox.normalizePtzPreset({
  id: 'p-1', name: 'Gate', pan: '45', tilt: '120', roll: '-5', zoom: '4',
  projectionDistance: '75', viewportPalette: 'whiteHot', roi: { width: 0.5, height: 0.25 }
})));
assert.equal(normalized.id, 'p-1');
assert.equal(normalized.pan, 45);
assert.equal(normalized.tilt, 90);
assert.equal(normalized.roll, -5);
assert.equal(normalized.zoom, 4);
assert.equal(normalized.projectionDistance, 75);
assert.equal(normalized.viewportPalette, 'whiteHot');
assert.equal(normalized.roi.width, 0.5);
assert.equal(normalized.roi.height, 0.25);
assert.deepEqual(normalized.rois, []);
const camera={data:{ptzPresets:[{id:'stable',name:'Stable',rois:[{id:'roi-1',name:'ROI 001',nodes:[{x:0,y:0},{x:1,y:0},{x:1,y:1}]}]}]}};
const first=sandbox.ensureCameraPtzPresets(camera)[0];
const second=sandbox.ensureCameraPtzPresets(camera)[0];
assert.equal(first,second,'Preset reference must remain stable across lookups');
first.rois=[];
assert.equal(sandbox.ensureCameraPtzPresets(camera)[0].rois.length,0,'ROI deletion must persist');
const namingCamera={data:{ptzPresets:[{name:'Preset 001'},{name:'Preset 004'},{name:'Custom'}]}};
assert.equal(sandbox.getNextPtzPresetName(namingCamera),'Preset 005');
namingCamera.data.ptzPresets.push({name:'Preset 005'});
assert.equal(sandbox.getNextPtzPresetName(namingCamera),'Preset 006');
assert.equal(sandbox.shortestAngleDelta(170, -170), 20);
assert.equal(sandbox.shortestAngleDelta(-170, 170), -20);
assert.match(source, /raw < 0\.5 \? 4 \* raw \* raw \* raw/);
assert.match(source, /cancelCameraPresetAnimation\(cameraItem/);
assert.match(source, /syncCameraPalette\(cameraItem, preset\.viewportPalette\)/);
console.log('8e.7.1 PTZ preset normalization and animation runtime tests passed');

