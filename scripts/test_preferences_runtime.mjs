import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../static/viewer.js', import.meta.url), 'utf8');
const defaultsStart = source.indexOf('const DEFAULT_PREFERENCES');
const defaultsEnd = source.indexOf('const preferenceControls', defaultsStart);
const sanitizerStart = source.indexOf('function sanitizePreferences', defaultsEnd);
const sanitizerEnd = source.indexOf('function loadPreferences()', sanitizerStart);
assert.ok(
  defaultsStart >= 0 && defaultsEnd > defaultsStart && sanitizerStart > defaultsEnd && sanitizerEnd > sanitizerStart,
  'Preference sanitizer source blocks were not found'
);

const executable = [
  source.slice(defaultsStart, defaultsEnd),
  source.slice(sanitizerStart, sanitizerEnd),
  'this.sanitizePreferences = sanitizePreferences;',
  'this.defaults = DEFAULT_PREFERENCES;'
].join('\n');
const sandbox = {};
vm.runInNewContext(executable, sandbox);

const defaults = JSON.parse(JSON.stringify(sandbox.defaults));
assert.deepEqual(JSON.parse(JSON.stringify(sandbox.sanitizePreferences(null))), defaults);
assert.deepEqual(JSON.parse(JSON.stringify(sandbox.sanitizePreferences('invalid'))), defaults);

const sanitized = JSON.parse(JSON.stringify(sandbox.sanitizePreferences({
  theme: 'dark',
  reversePan: true,
  reverseTilt: true,
  invertZoom: true,
  rendererQuality: 'balanced',
  showGrid: false,
  showAxes: false,
  coneOpacity: 99,
  fbxAutoScale: false,
  unexpected: 'ignored'
})));

assert.equal(sanitized.theme, 'dark');
assert.equal(sanitized.rendererQuality, 'balanced');
assert.equal(sanitized.reversePan, true);
assert.equal(sanitized.showGrid, false);
assert.equal(sanitized.coneOpacity, 0.5);
assert.equal(sanitized.fbxAutoScale, false);
assert.equal('unexpected' in sanitized, false);

const invalidEnums = JSON.parse(JSON.stringify(sandbox.sanitizePreferences({
  theme: 'neon',
  rendererQuality: 'ultra',
  coneOpacity: -5
})));
assert.equal(invalidEnums.theme, 'light');
assert.equal(invalidEnums.rendererQuality, 'high');
assert.equal(invalidEnums.coneOpacity, 0.05);

console.log('8e.4 preference sanitizer runtime tests passed');