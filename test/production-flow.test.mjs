import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] || '';

function functionSource(name) {
  const start = script.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const open = script.indexOf('{', start);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = open; index < script.length; index += 1) {
    const char = script[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return script.slice(start, index + 1);
    }
  }
  throw new Error(`unterminated function ${name}`);
}

test('inline application JavaScript has valid syntax', () => {
  assert.doesNotThrow(() => new Function(script));
});

test('advance booking uses the latest Bangkok, item-ready, and offer-available date', () => {
  const names = ['dateOnly', 'ddmmyyyy', 'parseIsoLikeDate', 'parseDdMmYyyy', 'addDays', 'calculateRentalWindow'];
  const calculate = new Function(`${names.map(functionSource).join('\n')}\nreturn calculateRentalWindow;`)();
  const result = calculate(
    new Date(Date.UTC(2026, 7, 28, 12)),
    new Date(Date.UTC(2026, 8, 15, 12)),
    new Date(Date.UTC(2026, 8, 24, 12)),
    10,
    true
  );
  assert.deepEqual(result, { start: '24/09/2026', end: '03/10/2026', mode: 'reserve' });
  assert.match(script, /const BUSINESS_TIME_ZONE = 'Asia\/Bangkok'/);
});

test('backend bookings replace local state and confirmed or expired rows are hidden', () => {
  assert.match(functionSource('refreshBookingsFromBackend'), /replaceBookingsFromBackend\(res\.bookings \|\| \[\]\)/);
  assert.match(functionSource('isConfirmedBooking'), /toLowerCase\(\) === 'confirmed'/);
  assert.match(functionSource('pruneBookings'), /ageMs >= 0 && ageMs < BOOKING_TTL_MS/);
});

test('rent button saves locally and starts backend sync without awaiting before clipboard', () => {
  const addSource = functionSource('addBookingRequest');
  const clickSource = functionSource('handleLineShare');
  assert.ok(addSource.indexOf('saveBookings(bookings)') < addSource.indexOf('sendBookingToBackend(booking)'));
  assert.doesNotMatch(clickSource, /await\s+(?:addBookingRequest|sendBookingToBackend|bookingBackendRequest)/);
  assert.ok(clickSource.indexOf('addBookingRequest(') < clickSource.indexOf('navigator.clipboard'));
  assert.match(clickSource, /button\.disabled = true/);
  assert.match(clickSource, /button\.textContent = tr\('preparing'\)/);
  assert.match(clickSource, /finally\s*{[\s\S]*restoreShareButton/);
});

test('copy confirmation offers the rent guide above OK', () => {
  const guideIndex = html.indexOf('id="copyModalGuideBtn"');
  const okIndex = html.indexOf('id="copyModalOkBtn"');
  assert.ok(guideIndex > 0 && guideIndex < okIndex);
  assert.match(html, /class="copy-guide-btn"/);
  assert.match(script, /closeCopyModal\(\);\s*openInfoModal\('rentGuide'\)/);
});
