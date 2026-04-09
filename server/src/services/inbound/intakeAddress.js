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

  if (!localPart.startsWith(prefix)) {
    return '';
  }

  return localPart.slice(prefix.length);
}

export function pickWorkspaceRecipient(recipients = []) {
  const list = Array.isArray(recipients) ? recipients : [recipients];
  return list.find((recipient) => extractWorkspaceIdFromRecipient(recipient)) || list[0] || '';
}
