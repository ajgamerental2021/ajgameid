import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('ID catalogue initializes LIFF and sends the verified access token server-side', () => {
  assert.match(html, /static\.line-scdn\.net\/liff\/edge\/2\/sdk\.js/);
  assert.match(html, /initializeIdRentalLiff/);
  assert.match(html, /idRentalLiffId/);
  assert.match(html, /lineAccessToken: lineIdentity\.accessToken/);
  assert.match(html, /const isLineInAppBrowser = \/\\bLine\\\//);
  assert.doesNotMatch(html, /withLoginOnExternalBrowser:\s*true/);
  assert.match(html, /window\.liff\.isInClient\(\)/);
  assert.match(html, /window\.liff\.getProfile\(\)/);
  assert.match(html, /lineIdentityBadge/);
});

test('successful LIFF booking skips copy instructions and reports the automatic Flex', () => {
  assert.match(html, /lineLinked && saved\?\.result\?\.flexSent/);
  assert.match(html, /ส่งคำขอเช่าไอดีให้ร้าน AJ แล้ว/);
  assert.match(html, /Your ID rental request has been sent to AJ/);
  assert.match(html, /openLineShop: 'เปิด LINE ร้าน AJ'/);
  assert.match(html, /copyModalUsesLine \? 'openLineShop' : 'rentGuideHelp'/);
  assert.match(html, /else openInfoModal\('rentGuide'\)/);
  assert.doesNotMatch(html, /id="copyModalGuideText">วิธีการแจ้งเช่าไอดี/);
});

test('customer page removes legacy result hint and footer output', () => {
  assert.doesNotMatch(html, /id="resultsHintText"/);
  assert.doesNotMatch(html, /id="footerText"/);
  assert.doesNotMatch(html, /class="footer"/);
});
