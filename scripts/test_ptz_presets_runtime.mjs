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
  section('function shortestAngleDelta', 'function ensurePtzPresetPanel'),
  'this.getNextPtzPresetName = getNextPtzPresetName;',
  'this.normalizePtzPreset = normalizePtzPreset;',
  'this.ensureCameraPtzPresets = ensureCameraPtzPresets;',
  'this.shortestAngleDelta = shortestAngleDelta;',
  'this.recallPtzPreset = recallPtzPreset;',
  'this.updatePtzPresetAnimations = updatePtzPresetAnimations;'
].join('\n');
class TestVector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  clone() { return new TestVector3(this.x, this.y, this.z); }
  lerpVectors(from, to, t) {
    this.x = from.x + (to.x - from.x) * t;
    this.y = from.y + (to.y - from.y) * t;
    this.z = from.z + (to.z - from.z) * t;
    return this;
  }
}
class TestQuaternion {
  clone() { return new TestQuaternion(); }
  setFromEuler() { return this; }
  slerpQuaternions() { return this; }
}
class TestEuler {}
let rigApplications = 0;
let overlayRefreshes = 0;
const activePtzPresetAnimations = new Map();
const sandbox = {
  Date,
  THREE: {
    MathUtils: {
      clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
      lerp: (from, to, t) => from + (to - from) * t
    },
    Vector3: TestVector3,
    Quaternion: TestQuaternion,
    Euler: TestEuler
  },
  activePtzPresetAnimations,
  preferences: { ptzPresetSpeed: 10 },
  performance: { now: () => 1000 },
  ptzPresetPanel: null,
  activePresetCamera: null,
  cancelCameraPresetAnimation: cameraItem => activePtzPresetAnimations.delete(cameraItem.id),
  refreshPresetRoiOverlays: () => { overlayRefreshes += 1; },
  updateProjectionDistance: (cameraItem, distance) => { cameraItem.data.projectionDistance = distance; },
  applyCameraPtzRig: () => { rigApplications += 1; },
  syncCameraPalette: (cameraItem, palette) => { cameraItem.data.viewportPalette = palette; },
  refreshCameraPresetDerivedData: cameraItem => cameraItem.data.ptzPresets,
  requestAnimationFrame: callback => callback(),
  formatMetric: value => String(value)
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
assert.ok(source.includes("const initialPresetId = cameraItem.data?.activePtzPresetId || previousSelection || ensureCameraPtzPresets(cameraItem)[0]?.id"));
assert.ok(source.includes("const recallTarget = preset || ensureCameraPtzPresets(activePresetCamera)"));

const recallCamera = {
  id: 'camera-001',
  type: 'camera',
  data: {
    pan: 0, tilt: 0, roll: 0, zoom: 1, hfov: 90, projectionDistance: 20,
    viewportPalette: 'visible', ptzPresets: []
  },
  object: {
    position: new TestVector3(1, 2, 3),
    quaternion: new TestQuaternion(),
    rotation: { order: 'XYZ' }
  }
};
const recallPreset = sandbox.normalizePtzPreset({
  id: 'preset-recall',
  name: 'Recall target',
  pan: 40,
  tilt: 25,
  roll: -10,
  zoom: 2,
  hfov: 45,
  projectionDistance: 35,
  viewportPalette: 'ironbow',
  cameraPosition: { x: 5, y: 6, z: 7 },
  cameraRotation: { x: 0.1, y: 0.2, z: 0.3 }
});
recallCamera.data.ptzPresets.push(recallPreset);
sandbox.recallPtzPreset(recallCamera, recallPreset);
assert.equal(activePtzPresetAnimations.size, 1, 'Recall must schedule an animation');
const recallAnimation = activePtzPresetAnimations.get(recallCamera.id);
assert.notEqual(recallAnimation.preset, recallPreset, 'Recall target must be a stable snapshot');
sandbox.updatePtzPresetAnimations(1000 + recallAnimation.durationMs + 1);
assert.equal(activePtzPresetAnimations.size, 0, 'Completed recall must leave no active animation');
assert.equal(recallCamera.data.pan, 40);
assert.equal(recallCamera.data.tilt, 25);
assert.equal(recallCamera.data.roll, -10);
assert.equal(recallCamera.data.zoom, 2);
assert.equal(recallCamera.data.hfov, 45);
assert.equal(recallCamera.data.projectionDistance, 35);
assert.equal(recallCamera.data.viewportPalette, 'ironbow');
assert.equal(recallCamera.data.activePtzPresetId, 'preset-recall');
assert.deepEqual(
  { x: recallCamera.object.position.x, y: recallCamera.object.position.y, z: recallCamera.object.position.z },
  { x: 5, y: 6, z: 7 }
);
assert.ok(rigApplications >= 2, 'Recall must apply the PTZ hierarchy during and after animation');
assert.ok(overlayRefreshes >= 2, 'Recall must hide ROIs during movement and restore them after completion');
console.log('8e.7.4 PTZ preset selection and recall animation runtime tests passed');

