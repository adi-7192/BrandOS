function buildStatus(label, tone, meta) {
  return { label, tone, meta };
}

export function buildLinkedInViewModel(linkedin = {}) {
  if (linkedin.status === 'connected' && linkedin.connected) {
    return {
      label: 'Connected',
      tone: 'success',
      ctaLabel: 'Reconnect LinkedIn',
      helper: 'Your personal LinkedIn account is connected for direct publishing from BrandOS.',
      connectedAs: linkedin.displayName || '',
      expiresMeta: linkedin.expiresAt ? 'Token active' : '',
    };
  }

  if (linkedin.status === 'reconnect_required') {
    return {
      label: 'Reconnect required',
      tone: 'warning',
      ctaLabel: 'Reconnect LinkedIn',
      helper: 'Reconnect your personal LinkedIn account to keep publishing from BrandOS.',
      connectedAs: linkedin.displayName || '',
      expiresMeta: 'Token expired',
    };
  }

  if (linkedin.status === 'connection_error') {
    return {
      label: 'Connection error',
      tone: 'warning',
      ctaLabel: 'Reconnect LinkedIn',
      helper: 'LinkedIn needs attention before BrandOS can publish on your behalf.',
      connectedAs: linkedin.displayName || '',
      expiresMeta: '',
    };
  }

  return {
    label: 'Not connected',
    tone: 'neutral',
    ctaLabel: 'Connect LinkedIn',
    helper: 'Connect your personal LinkedIn account to publish approved drafts directly from BrandOS.',
    connectedAs: '',
    expiresMeta: '',
  };
}

export function buildLinkedInPublishState({ activeTab, content, linkedin = {}, publishing }) {
  if (activeTab !== 'linkedin') {
    return {
      visible: false,
      disabled: true,
      label: 'Publish to LinkedIn',
      helper: '',
    };
  }

  const trimmed = String(content || '').trim();
  if (!linkedin.connected) {
    return {
      visible: true,
      disabled: true,
      label: 'Publish to LinkedIn',
      helper: 'Connect LinkedIn in Settings before publishing.',
    };
  }

  if (!trimmed) {
    return {
      visible: true,
      disabled: true,
      label: 'Publish to LinkedIn',
      helper: 'Add LinkedIn copy before publishing.',
    };
  }

  return {
    visible: true,
    disabled: Boolean(publishing),
    label: publishing ? 'Publishing…' : 'Publish to LinkedIn',
    helper: 'This publishes immediately to your connected personal LinkedIn account.',
  };
}

export function buildLinkedInStatus(linkedin = {}) {
  if (linkedin.connected && linkedin.status === 'connected') {
    return buildStatus('Connected', 'success', linkedin.displayName || 'Ready to publish');
  }

  if (linkedin.status === 'reconnect_required') {
    return buildStatus('Reconnect required', 'warning', linkedin.displayName || 'LinkedIn token expired');
  }

  if (linkedin.status === 'connection_error') {
    return buildStatus('Needs attention', 'warning', linkedin.displayName || 'Check LinkedIn connection');
  }

  return buildStatus('Not connected', 'neutral', 'Personal publishing unavailable');
}
