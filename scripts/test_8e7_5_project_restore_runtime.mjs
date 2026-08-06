import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../static/viewer.js', import.meta.url), 'utf8');
function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing ${startMarker}`);
  assert.notEqual(end, -1, `Missing ${endMarker}`);
  return source.slice(start, end);
}

const sceneObjects = [
  {
    id: 'model-current', name: 'Plant', type: 'model', data: {
      fileName: 'plant.glb', sourceFormat: 'glb', sourcePath: 'C:\\Models\\plant.glb', sourceRoute: null, storage: 'browser-session'
    }, object: { userData: {} }
  },
  { id: 'camera-keep', name: 'Camera Keep', type: 'camera' },
  { id: 'camera-extra', name: 'Camera Extra', type: 'camera' }
];
const confirms = [];
const context = vm.createContext({
  sceneObjects,
  confirm: message => { confirms.push(message); return false; }
});
const executable = [
  section('function normalizeModelSourceFormat', 'function disposeObjectResources'),
  section('function modelMatchesSavedSource', 'function removeSceneItem')
].join('\n');
vm.runInContext(executable, context);

const descriptor = context.getModelSourceDescriptor(sceneObjects[0]);
assert.equal(descriptor.fileName, 'plant.glb');
assert.equal(descriptor.path, 'C:\\Models\\plant.glb');
assert.equal(descriptor.route, null);
assert.equal(descriptor.storage, 'browser-session');
assert.equal(descriptor.fallbackRoute, '/models/plant.glb');
assert.equal(descriptor.restorable, false);

const project = {
  models: [{
    id: 'model-current', name: 'Plant',
    source: { fileName: 'plant.glb', sourceFormat: 'glb', path: 'C:\\Models\\plant.glb', route: null, storage: 'browser-session' }
  }],
  cameras: [{ id: 'camera-keep', name: 'Camera Keep' }],
  assetManifest: { models: [] }
};
const savedSource = context.resolveSavedModelSource(project, project.models[0], 0);
assert.equal(savedSource.path, 'C:\\Models\\plant.glb');
assert.equal(savedSource.fallbackRoute, '/models/plant.glb');

const replacements = context.getProjectReplacementItems(project);
assert.deepEqual(Array.from(replacements, item => item.id), ['camera-extra']);
assert.equal(context.confirmProjectReplacement(replacements), false);
assert.match(confirms[0], /Camera Extra/);
assert.match(confirms[0], /will be removed/);
assert.equal(context.confirmProjectReplacement([]), true);

console.log('8e.7.5 model source and transactional replacement runtime tests passed');