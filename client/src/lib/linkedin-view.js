function buildStatus(label, tone, meta) {
  return { label, tone, meta };
}

export function buildLinkedInViewModel(linkedin = {}) {
  if (linkedin.status === 'connected' && linkedin.connected) {
    return {
      title: 'LinkedIn connected',
      tone: 'success',
      badgeLabel: 'Connected',
      primaryActionLabel: 'Connected',
      secondaryActionLabel: 'Disconnect',
      reconnectActionLabel: 'Reconnect',
      summary: 'BrandOS can publish approved posts to your personal LinkedIn account.',
      connectedAs: linkedin.displayName || '',
      accountEmail: linkedin.email || '',
      readinessLabel: 'Ready to publish',
      lastCheckedLabel: linkedin.lastValidatedAt ? 'Last checked' : '',
      lastCheckedValue: linkedin.lastValidatedAt || '',
      bullets: [],
    };
  }

  if (linkedin.status === 'reconnect_required') {
    return {
      title: 'Reconnect LinkedIn',
      tone: 'warning',
      badgeLabel: 'Reconnect required',
      primaryActionLabel: 'Reconnect LinkedIn',
      secondaryActionLabel: 'Disconnect',
      reconnectActionLabel: '',
      summary: 'Your LinkedIn connection needs attention before BrandOS can publish again.',
      connectedAs: linkedin.displayName || '',
      accountEmail: linkedin.email || '',
      readinessLabel: 'Publishing blocked',
      lastCheckedLabel: '',
      lastCheckedValue: '',
      bullets: [],
    };
  }

  if (linkedin.status === 'connection_error') {
    return {
      title: 'Reconnect LinkedIn',
      tone: 'warning',
      badgeLabel: 'Connection error',
      primaryActionLabel: 'Reconnect LinkedIn',
      secondaryActionLabel: 'Disconnect',
      reconnectActionLabel: '',
      summary: 'LinkedIn needs attention before BrandOS can publish on your behalf.',
      connectedAs: linkedin.displayName || '',
      accountEmail: linkedin.email || '',
      readinessLabel: 'Publishing blocked',
      lastCheckedLabel: '',
      lastCheckedValue: '',
      bullets: [],
    };
  }

  return {
    title: 'Connect LinkedIn',
    tone: 'neutral',
    badgeLabel: 'Not connected',
    primaryActionLabel: 'Connect LinkedIn',
    secondaryActionLabel: '',
    reconnectActionLabel: '',
    summary: 'Connect your personal LinkedIn account to publish approved drafts directly from BrandOS.',
    connectedAs: '',
    accountEmail: '',
    readinessLabel: 'Publishing unavailable',
    lastCheckedLabel: '',
    lastCheckedValue: '',
    bullets: [
      'Connect once from Settings',
      'Approve BrandOS in LinkedIn',
      'Publish approved LinkedIn drafts directly from BrandOS',
    ],
  };
}

export function buildLinkedInPublishState({ activeTab, content, linkedin = {}, publishing }) {
  if (activeTab !== 'linkedin') {
    return {
      visible: false,
      mode: 'hidden',
      disabled: true,
      badgeLabel: '',
      title: '',
      label: 'Publish to LinkedIn',
      helper: '',
      primaryActionLabel: '',
      secondaryActionLabel: '',
      steps: [],
    };
  }

  const trimmed = String(content || '').trim();
  if (!linkedin.connected) {
    return {
      visible: true,
      mode: 'setup',
      disabled: true,
      badgeLabel: 'Setup required',
      title: 'Publish to LinkedIn',
      label: 'Publish to LinkedIn',
      helper: 'You can publish this post directly from BrandOS. Connect LinkedIn once in Settings and BrandOS can post on your behalf.',
      primaryActionLabel: 'Connect LinkedIn in Settings',
      secondaryActionLabel: 'Copy draft for now',
      steps: [
        'Open Settings',
        'Connect your personal LinkedIn',
        'Come back here and publish directly',
      ],
    };
  }

  if (!trimmed) {
    return {
      visible: true,
      mode: 'ready',
      disabled: true,
      badgeLabel: 'Ready to publish',
      title: 'Publish to LinkedIn',
      label: 'Publish to LinkedIn',
      helper: 'BrandOS is connected and ready. Finish your LinkedIn draft to unlock publishing.',
      primaryActionLabel: 'Publish to LinkedIn',
      secondaryActionLabel: 'Copy draft for now',
      steps: [],
    };
  }

  return {
    visible: true,
    mode: 'ready',
    disabled: Boolean(publishing),
    badgeLabel: publishing ? 'Publishing…' : 'Ready to publish',
    title: 'Publish to LinkedIn',
    label: publishing ? 'Publishing…' : 'Publish to LinkedIn',
    helper: 'BrandOS is ready to publish this LinkedIn post directly to your connected account.',
    primaryActionLabel: 'Publish to LinkedIn',
    secondaryActionLabel: 'Copy draft for now',
    steps: [],
  };
}

export function buildLinkedInStatus(linkedin = {}) {
  if (linkedin.connected && linkedin.status === 'connected') {
    return buildStatus('Connected', 'success', 'Ready to publish');
  }

  if (linkedin.status === 'reconnect_required') {
    return buildStatus('Reconnect required', 'warning', 'Publishing blocked');
  }

  if (linkedin.status === 'connection_error') {
    return buildStatus('Needs attention', 'warning', 'Check connection');
  }

  return buildStatus('Not connected', 'neutral', 'Personal publishing unavailable');
}

export function buildLinkedInFeedbackState(status, message = '') {
  if (status === 'connected') {
    return {
      tone: 'success',
      message: message || 'LinkedIn connected. BrandOS is ready to publish approved LinkedIn posts from your personal account.',
    };
  }

  if (status === 'disconnected') {
    return {
      tone: 'success',
      message: message || 'LinkedIn disconnected.',
    };
  }

  if (status === 'error') {
    return {
      tone: 'warning',
      message: message || 'LinkedIn could not be connected. Try again or reconnect from Settings.',
    };
  }

  return {
    tone: 'neutral',
    message,
  };
}
