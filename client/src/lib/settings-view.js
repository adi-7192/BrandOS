import { buildLinkedInStatus } from './linkedin-view.js';

function buildStatus(label, tone, meta) {
  return { label, tone, meta };
}

export function buildSettingsViewModel(settings) {
  const workspace = settings?.workspace || {};
  const inbox = settings?.inbox || {};
  const ai = settings?.ai || {};
  const security = settings?.security || {};
  const linkedin = settings?.linkedin || {};

  const workspaceStatus = workspace.onboardingComplete && workspace.brandCount > 0
    ? buildStatus('Ready', 'success', `${workspace.brandCount} brands live`)
    : buildStatus('In setup', 'warning', workspace.brandCount > 0 ? `${workspace.brandCount} brands live` : 'Add your first brand');

  const inboxStatus = inbox.gmailAvailable && inbox.intakeEmail
    ? buildStatus(
        workspace.gmailConnectionStatus === 'connected' ? 'Connected' : 'Available',
        workspace.gmailConnectionStatus === 'connected' ? 'success' : 'neutral',
        'Forwarding address active'
      )
    : buildStatus('Unavailable', 'neutral', 'Intake email not configured');

  const aiStatus = ai.configured
    ? buildStatus('Active', 'success', `${ai.provider} · ${ai.model}`)
    : buildStatus('Needs attention', 'warning', `${ai.provider} · ${ai.model}`);

  const linkedinStatus = buildLinkedInStatus(linkedin);

  const securityMethods = [
    security.googleConnected ? 'Google' : null,
    security.passwordEnabled ? 'Password' : null,
    security.ssoEnabled ? 'SSO' : null,
  ].filter(Boolean);

  return {
    workspaceStatus,
    inboxStatus,
    aiStatus,
    linkedinStatus,
    securityMethods,
  };
}
