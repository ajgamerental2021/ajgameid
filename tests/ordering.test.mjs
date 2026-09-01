import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('admin ID order is editable and preserved', () => {
  assert.match(html, /id="fIdNo" type="number" min="1"\s*\/>/);
  assert.match(html, /labelIdNo: 'ลำดับ ID \(แก้ไขได้\)'/);
  assert.match(html, /labelIdNo: 'ID order \(editable\)'/);
  assert.match(html, /function preserveItemIds\(items\)/);
  assert.doesNotMatch(html, /function normalizeSequentialIds\(items\)/);
  assert.match(html, /const duplicate = state\.some/);
});

test('not-ready games sort first by farthest ready date, then manual ID', () => {
  assert.match(html, /if \(aNotReady !== bNotReady\) return aNotReady \? -1 : 1/);
  assert.match(html, /readyDateSortValue\(b\)\.localeCompare\(readyDateSortValue\(a\)\)/);
  assert.match(html, /Number\(a\?\.idNo\).*Number\(b\?\.idNo\)/);
});

test('not-ready games require a ready date in both languages', () => {
  assert.match(html, /draft\.notReady && !draft\.readyDate/);
  assert.match(html, /กรุณาเลือกวันที่พร้อมให้บริการ/);
  assert.match(html, /Please select the ready-for-service date/);
});
