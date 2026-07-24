import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../static/viewer.js', import.meta.url), 'utf8');
const start = source.indexOf('function getCameraWallDimension(count)');
const end = source.indexOf('function arrangeCameraViewports()', start);
assert.ok(start >= 0 && end > start, 'Wall-dimension function was not found');

const sandbox = {};
vm.runInNewContext(
  `${source.slice(start, end)}\nthis.getCameraWallDimension = getCameraWallDimension;`,
  sandbox
);

const expected = new Map([
  [1, 1],
  [2, 2],
  [4, 2],
  [5, 3],
  [9, 3],
  [10, 4],
  [16, 4],
]);
for (const [count, dimension] of expected) {
  assert.equal(sandbox.getCameraWallDimension(count), dimension, `${count} viewports should use ${dimension}x${dimension}`);
}

console.log('8e.6 viewport wall-dimension runtime tests passed');