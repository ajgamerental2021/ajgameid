import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('ID catalogue initializes LIFF and sends the verified access token server-side', () => {
  assert.match(html, /static\.line-scdn\.net\/liff\/edge\/2\/sdk\.js/);
  assert.match(html, /initializeIdRentalLiff/);
  assert.match(html, /idRentalLiffId/);
  assert.match(html, /lineAccessToken: lineIdentity\.accessToken/);
});

test('successful LIFF booking skips copy instructions and reports the automatic Flex', () => {
  assert.match(html, /lineLinked && saved\?\.result\?\.flexSent/);
  assert.match(html, /ส่งคำขอเช่าไอดีให้ร้าน AJ แล้ว/);
  assert.match(html, /Your ID rental request has been sent to AJ/);
  assert.match(html, /openLineShop: 'เปิด LINE ร้าน AJ'/);
  assert.doesNotMatch(html, /id="copyModalGuideText">วิธีการแจ้งเช่าไอดี/);
});
