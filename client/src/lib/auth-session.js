const TOKEN_KEY = 'token';

export function applyClientAuth({ api, storage = globalThis.localStorage, token }) {
  if (!token) {
    clearClientAuth({ api, storage });
    return;
  }

  storage?.setItem?.(TOKEN_KEY, token);
  ensureApiHeaders(api);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearClientAuth({ api, storage = globalThis.localStorage }) {
  storage?.removeItem?.(TOKEN_KEY);
  if (api?.defaults?.headers?.common && 'Authorization' in api.defaults.headers.common) {
    delete api.defaults.headers.common.Authorization;
  }
}

function ensureApiHeaders(api) {
  if (!api.defaults) {
    api.defaults = {};
  }
  if (!api.defaults.headers) {
    api.defaults.headers = {};
  }
  if (!api.defaults.headers.common) {
    api.defaults.headers.common = {};
  }
}
