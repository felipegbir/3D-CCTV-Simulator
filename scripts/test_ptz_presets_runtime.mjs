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
  section('function normalizePtzPreset', 'function ensureCameraPtzPresets'),
  section('function shortestAngleDelta', 'function applyAnimatedOpticalState'),
  'this.normalizePtzPreset = normalizePtzPreset;',
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
assert.deepEqual(normalized.roi, { width: 0.5, height: 0.25 });
assert.equal(sandbox.shortestAngleDelta(170, -170), 20);
assert.equal(sandbox.shortestAngleDelta(-170, 170), -20);
assert.match(source, /raw < 0\.5 \? 4 \* raw \* raw \* raw/);
assert.match(source, /cancelCameraPresetAnimation\(cameraItem/);
assert.match(source, /syncCameraPalette\(cameraItem, preset\.viewportPalette\)/);
console.log('8e.7.1 PTZ preset normalization and animation runtime tests passed');