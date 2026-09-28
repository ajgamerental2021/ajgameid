(function () {
  'use strict';

  function endpoint(apiBase, path) {
    return `${String(apiBase || '').replace(/\/$/, '')}${path}`;
  }

  async function readJson(response) {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(body.error || 'passkey_request_failed'));
    return body;
  }

  function supported() {
    return Boolean(window.PublicKeyCredential && window.SimpleWebAuthnBrowser?.browserSupportsWebAuthn?.());
  }

  async function login(apiBase) {
    if (!supported()) throw new Error('passkey_not_supported');
    const begin = await fetch(endpoint(apiBase, '/api/admin/passkeys/authentication/options'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: window.location.origin }),
    }).then(readJson);
    const response = await window.SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: begin.options });
    return fetch(endpoint(apiBase, '/api/admin/passkeys/authentication/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ceremonyId: begin.ceremonyId, response }),
    }).then(readJson);
  }

  async function register(apiBase, adminToken, label) {
    if (!supported()) throw new Error('passkey_not_supported');
    if (!adminToken) throw new Error('admin_login_required');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };
    const begin = await fetch(endpoint(apiBase, '/api/admin/passkeys/registration/options'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ origin: window.location.origin }),
    }).then(readJson);
    const response = await window.SimpleWebAuthnBrowser.startRegistration({ optionsJSON: begin.options });
    return fetch(endpoint(apiBase, '/api/admin/passkeys/registration/verify'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ ceremonyId: begin.ceremonyId, response, label: String(label || '') }),
    }).then(readJson);
  }

  window.AJAdminPasskey = Object.freeze({ supported, login, register });
})();
