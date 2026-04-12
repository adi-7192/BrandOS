// In-memory JWT denylist. Survives only the current process lifetime —
// acceptable for V1; replace the Map with a Redis SET for multi-instance deploys.

const revokedJtis = new Map(); // jti (string) -> exp (unix seconds)

export function revokeToken(jti, exp) {
  revokedJtis.set(jti, exp);
}

export function isRevoked(jti) {
  const exp = revokedJtis.get(jti);
  if (exp === undefined) return false;
  if (Date.now() / 1000 > exp) {
    revokedJtis.delete(jti);
    return false; // already expired naturally — not a live threat
  }
  return true;
}

// Prune entries whose tokens have already expired (no point keeping them).
setInterval(() => {
  const nowSec = Date.now() / 1000;
  for (const [jti, exp] of revokedJtis) {
    if (nowSec > exp) revokedJtis.delete(jti);
  }
}, 60 * 60 * 1000).unref();
