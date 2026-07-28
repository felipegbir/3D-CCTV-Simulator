import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../static/viewer.js', import.meta.url), 'utf8');

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

const executable = [
  "const PROJECT_SCHEMA_VERSION = 7;",
  "const LEGACY_PROJECT_SCHEMA_VERSION = 1;",
  section('function buildProjectAssetManifest()', 'function formatAssetWarningMessage'),
  section('function formatAssetWarningMessage', 'function validateProjectSchema'),
  section('function validateProjectSchema', 'function showProjectAssetWarnings'),
  section('function showProjectAssetWarnings', 'function applyLoadedProject')
].join('\n');

const alerts = [];
const confirms = [];
const context = vm.createContext({
  Date,
  alerts,
  alert: message => alerts.push(message),
  confirm: message => {
    confirms.push(message);
    return false;
  },
  sceneObjects: [
    {
      id: 'model-server',
      name: 'Server Model',
      type: 'model',
      object: { userData: {} }
    },
    {
      id: 'model-local',
      name: 'Local Plant.fbx',
      type: 'model',
      data: { sourceFormat: 'fbx' },
      object: { userData: { sourceFormat: 'fbx', fileName: 'Local Plant.fbx' } }
    },
    {
      id: 'reference-local',
      name: 'Floor Plan.png',
      type: 'object',
      data: { referenceImage: true, fileName: 'Floor Plan.png' },
      object: { userData: {} }
    }
  ]
});

vm.runInContext(executable, context);

const manifest = context.buildProjectAssetManifest();
assert.equal(manifest.models.length, 2);
assert.equal(manifest.referenceImages.length, 1);
assert.equal(manifest.models[0].storage, 'server');
assert.equal(manifest.models[0].restorable, true);
assert.equal(manifest.models[1].storage, 'browser-session');
assert.equal(manifest.models[1].restorable, false);
assert.deepEqual(
  Array.from(manifest.warnings, warning => warning.code),
  ['LOCAL_MODEL_NOT_EMBEDDED', 'REFERENCE_IMAGE_NOT_EMBEDDED']
);
assert.match(manifest.warnings[0].message, /Local Plant\.fbx/);
assert.match(manifest.warnings[1].message, /Floor Plan\.png/);

alerts.length = 0;
assert.equal(context.validateProjectSchema({ schemaVersion: 7 }), true);
assert.equal(alerts.length, 0);

assert.equal(context.validateProjectSchema({}), true);
assert.match(alerts.pop(), /Legacy project schema 1/);

assert.equal(context.validateProjectSchema({ schemaVersion: 8 }), false);
assert.match(alerts.pop(), /newer simulator version/);

assert.equal(context.validateProjectSchema({ schemaVersion: 'invalid' }), false);
assert.match(alerts.pop(), /invalid schemaVersion/);

console.log('8e.7.1 runtime schema and asset manifest tests passed');
