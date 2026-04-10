export function buildKitLiveNextSteps({ linkedinConnected = false } = {}) {
  return [
    {
      title: 'Connect your inbox',
      description: 'Bring campaign briefs into BrandOS automatically so you can review new requests without copying them over by hand.',
      actionLabel: 'Open inbox setup',
      actionId: 'open-inbox-settings',
    },
    linkedinConnected
      ? {
        title: 'LinkedIn already connected',
        description: 'Your personal LinkedIn is already connected, so BrandOS is ready to publish approved LinkedIn drafts for this user.',
        actionLabel: 'Manage in Settings',
        actionId: 'open-linkedin-settings',
        completed: true,
      }
      : {
        title: 'Connect LinkedIn',
        description: 'Set up direct personal posting once so approved LinkedIn drafts can be published from BrandOS.',
        actionLabel: 'Connect LinkedIn now',
        actionId: 'connect-linkedin',
      },
    {
      title: 'Create your first campaign',
      description: 'Start from the dashboard when you are ready to turn a campaign brief into review-ready content.',
      actionLabel: 'Go to dashboard',
      actionId: 'open-dashboard',
    },
  ];
}
