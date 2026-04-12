// Workspace IDs are PostgreSQL UUIDs. Enforcing the format here ensures that
// only valid UUIDs ever reach the DB lookup, and prevents non-UUID strings
// (including path-traversal attempts or arbitrary garbage) from being used
// as workspace identifiers even though the downstream query is parameterized.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function buildWorkspaceIntakeLocalPart(workspaceId = '') {
  return `updates+${workspaceId}`;
}

export function buildWorkspaceIntakeEmail(workspaceId = '', domain = '') {
  if (!workspaceId || !domain) return null;
  return `${buildWorkspaceIntakeLocalPart(workspaceId)}@${domain}`;
}

export function extractWorkspaceIdFromRecipient(address = '') {
  const normalized = String(address || '').trim().toLowerCase();
  const localPart = normalized.split('@')[0] || '';
  const prefix = 'updates+';

  if (!localPart.startsWith(prefix)) return '';

  const candidate = localPart.slice(prefix.length);
  return UUID_RE.test(candidate) ? candidate : '';
}

export function pickWorkspaceRecipient(recipients = []) {
  const list = Array.isArray(recipients) ? recipients : [recipients];
  return list.find((recipient) => extractWorkspaceIdFromRecipient(recipient)) || list[0] || '';
}
