const service = location.pathname.includes('/dealer/') ? 'dealer' : 'fleet';
const tokenKey = 'accessToken';
const requestedUrl = location.href;
const requestedPath = location.pathname;
const nativeStorageGetItem = Storage.prototype.getItem;
const previewSessionFallback = { accessToken: null, refreshToken: null, userId: null };

Storage.prototype.getItem = function finalPreviewGetItem(key) {
  const value = nativeStorageGetItem.call(this, key);
  if (this === sessionStorage && !value && Object.hasOwn(previewSessionFallback, key)) {
    return previewSessionFallback[key];
  }
  return value;
};

function refreshOfflineToken(token, lifetimeSeconds) {
  try {
    const [header, payload] = String(token).split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    const now = Math.floor(Date.now() / 1000);
    decoded.iat = now;
    decoded.exp = now + lifetimeSeconds;
    const encoded = btoa(JSON.stringify(decoded)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return `${header}.${encoded}.offline`;
  } catch (_error) {
    return token;
  }
}

function hasValidSessionToken() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(tokenKey));
    const tokenPayload = String(stored?.value || '').split('.')[1];
    const normalized = tokenPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    return Number(payload.exp || 0) > Math.floor(Date.now() / 1000) + 60;
  } catch (_error) {
    return false;
  }
}

async function ensurePreviewSession(force = false) {
  if (!force && hasValidSessionToken()) return;
  const response = await fetch(`/api/common/auth/${service}/authenticate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'offline', password: 'offline-preview' }),
  });
  if (!response.ok) return;
  const payload = await response.json();
  const result = payload?.result;
  if (payload?.code !== '00' || !result?.access_token || !result?.refresh_token) return;
  const accessToken = refreshOfflineToken(result.access_token, 2 * 60 * 60);
  const refreshToken = refreshOfflineToken(result.refresh_token, 24 * 60 * 60);
  previewSessionFallback.accessToken = JSON.stringify({ value: accessToken, expires: '7200s' });
  previewSessionFallback.refreshToken = JSON.stringify({ value: refreshToken, expires: '86400s' });
  previewSessionFallback.userId = service === 'dealer' ? 'Test_Dealer2_Admin' : 'Test_Fleet2_Admin';
  sessionStorage.setItem('accessToken', previewSessionFallback.accessToken);
  sessionStorage.setItem('refreshToken', previewSessionFallback.refreshToken);
  sessionStorage.setItem('userId', previewSessionFallback.userId);
}

async function restoreRequestedPage() {
  if (requestedPath.includes('/login') || !location.pathname.includes('/login')) return;
  await ensurePreviewSession(true);
  location.replace(requestedUrl);
}

// The captured production bundle uses blocking alerts before moving to the
// login route. In this isolated review copy every API is local, so renew the
// preview session and keep the requested screen instead of opening a dialog.
window.alert = (message) => {
  console.warn('[final-preview alert]', String(message || ''));
};

await ensurePreviewSession();
await import(`/${service}/assets/index-dGkWfo-f.js`);

// Restore a deep link only when the production bundle evaluated authentication
// before the local preview session was ready. Permission checks are handled in
// the copied preview bundle and must not create a login/restore loop.
setTimeout(() => restoreRequestedPage().catch(() => {}), 1200);
