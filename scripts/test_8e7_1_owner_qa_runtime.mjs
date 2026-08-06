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
  section('function getCameraIdentity', 'function syncCameraPalette'),
  section('function calculatePtzRecallDurationMs', 'function recallPtzPreset'),
  'this.getPresetLimitIssues = getPresetLimitIssues;',
  'this.calculatePtzRecallDurationMs = calculatePtzRecallDurationMs;'
].join('\n');
const sandbox = {
  THREE: { MathUtils: { clamp: (value, min, max) => Math.min(max, Math.max(min, value)) } }
};
vm.runInNewContext(executable, sandbox);
const camera = { data: {
  supportsPan: false, supportsTilt: false, supportsZoom: false,
  focalLengthMinMm: 8, focalLengthMaxMm: 12
}};
const issues = sandbox.getPresetLimitIssues(camera, {
  pan: 15, tilt: -10, zoom: 3, currentFocalLengthMm: 20
});
assert.deepEqual(JSON.parse(JSON.stringify(issues)), [
  'pan unavailable', 'tilt unavailable', 'optical zoom unavailable', 'focal length above 12 mm'
]);
assert.equal(sandbox.calculatePtzRecallDurationMs(30, 5), 6000);
assert.equal(sandbox.calculatePtzRecallDurationMs(30, 30), 1000);
assert.ok(sandbox.calculatePtzRecallDurationMs(30, 5) > sandbox.calculatePtzRecallDurationMs(30, 30));
console.log('8e.7.1 owner-QA limit and movement-speed runtime tests passed');
