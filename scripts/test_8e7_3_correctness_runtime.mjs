import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../static/viewer.js', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = source.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `Missing function ${name}`);
  const signatureEnd = source.indexOf(')', start);
  const braceStart = source.indexOf('{', signatureEnd);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated function ${name}`);
}

const names = [
  'getCameraSensorResolution',
  'computeVerticalFovDegrees',
  'refreshDerivedCameraFov',
  'registerCameraId',
  'getNextAvailableCameraId',
  'resolveCameraObjectId',
  'resolveLoadedCameraId'
];
const definitions = names.map(extractFunction).join('\n\n');
const THREE = {
  MathUtils: {
    clamp: (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value)),
    degToRad: degrees => degrees * Math.PI / 180,
    radToDeg: radians => radians * 180 / Math.PI
  }
};
const buildHarness = new Function('THREE', `
  let cameraCounter = 1;
  const sceneObjects = [];
  ${definitions}
  return {
    sceneObjects,
    get cameraCounter() { return cameraCounter; },
    getCameraSensorResolution,
    computeVerticalFovDegrees,
    refreshDerivedCameraFov,
    registerCameraId,
    getNextAvailableCameraId,
    resolveCameraObjectId,
    resolveLoadedCameraId
  };
`);
const harness = buildHarness(THREE);

assert.ok(Math.abs(harness.computeVerticalFovDegrees(90, 1920, 1080) - 58.71550708558255) < 1e-10);
assert.ok(Math.abs(harness.computeVerticalFovDegrees(90, 640, 480) - 73.73979529168804) < 1e-10);
assert.ok(Math.abs(harness.computeVerticalFovDegrees(60, 1024, 1024) - 60) < 1e-10);
const optics = { hfov: 90, resolutionWidth: 1920, resolutionHeight: 1080, vfov: 123 };
assert.ok(Math.abs(harness.refreshDerivedCameraFov(optics) - 58.71550708558255) < 1e-10);
assert.ok(Math.abs(optics.vfov - 58.71550708558255) < 1e-10);

assert.equal(harness.resolveCameraObjectId('camera-005'), 'camera-005');
assert.equal(harness.cameraCounter, 6);
harness.sceneObjects.push({ id: 'camera-005', type: 'camera' });
assert.equal(harness.resolveCameraObjectId(), 'camera-006');
harness.sceneObjects.push({ id: 'camera-006', type: 'camera' });
assert.throws(() => harness.resolveCameraObjectId('camera-005'), /Camera ID collision/);

const claimed = new Set(['camera-010']);
const warnings = [];
harness.sceneObjects.push({ id: 'object-1', type: 'object' });
const repairedMissing = harness.resolveLoadedCameraId('', claimed, 0, warnings);
const repairedConflict = harness.resolveLoadedCameraId('object-1', claimed, 1, warnings);
assert.notEqual(repairedMissing, repairedConflict);
assert.equal(warnings.length, 2);
assert.ok(warnings[0].includes('missing camera ID'));
assert.ok(warnings[1].includes('conflicts with a non-camera object'));

console.log('8e.7.3 runtime camera identity and VFOV tests passed');