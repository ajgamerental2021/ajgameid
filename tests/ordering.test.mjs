import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .find(source => source.includes('function sortItems')) || '';

function functionSource(name) {
  const start = script.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const open = script.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < script.length; index += 1) {
    if (script[index] === '{') depth += 1;
    if (script[index] === '}' && --depth === 0) return script.slice(start, index + 1);
  }
  throw new Error(`unterminated function ${name}`);
}

test('admin ID order is editable and preserved', () => {
  assert.match(html, /id="fIdNo" type="number" min="1"\s*\/>/);
  assert.match(html, /labelIdNo: 'ลำดับ ID \(แก้ไขได้\)'/);
  assert.match(html, /labelIdNo: 'ID order \(editable\)'/);
  assert.match(html, /function preserveItemIds\(items\)/);
  assert.doesNotMatch(html, /function normalizeSequentialIds\(items\)/);
  assert.match(html, /const duplicate = state\.some/);
});

test('not-ready games sort first by farthest ready date, followed by newest ready IDs', () => {
  assert.match(html, /if \(aNotReady !== bNotReady\) return aNotReady \? -1 : 1/);
  assert.match(html, /readyDateSortValue\(b\)\.localeCompare\(readyDateSortValue\(a\)\)/);
  assert.match(html, /if \(aNotReady && bNotReady\)[\s\S]*?return \(Number\(a\?\.idNo\)[\s\S]*?- \(Number\(b\?\.idNo\)/);
  assert.match(html, /return \(Number\(b\?\.idNo\)[\s\S]*?- \(Number\(a\?\.idNo\)/);

  const sortItems = new Function(
    `${functionSource('readyDateSortValue')}\n${functionSource('sortItems')}\nreturn sortItems;`,
  )();
  const sorted = sortItems([
    { idNo: 67, notReady: false },
    { idNo: 68, notReady: false },
    { idNo: 70, notReady: true, readyDate: '2026-10-01' },
    { idNo: 69, notReady: true, readyDate: '2026-11-01' },
  ]);
  assert.deepEqual(sorted.map(item => item.idNo), [69, 70, 68, 67]);
});

test('not-ready games require a ready date in both languages', () => {
  assert.match(html, /draft\.notReady && !draft\.readyDate/);
  assert.match(html, /กรุณาเลือกวันที่พร้อมให้บริการ/);
  assert.match(html, /Please select the ready-for-service date/);
});
