export function needsWorkspaceProfileCompletion(user) {
  return !user?.workspaceProfileCompleted;
}

export function buildAuthEntryView(mode) {
  if (mode === 'signup') {
    return {
      title: 'Create a BrandOS workspace',
      subtitle: 'Start a new workspace for your team and move into brand setup next.',
      switchLabel: 'Already have a workspace?',
      switchCta: 'Sign in',
      nextStep: 'Next: workspace setup and brand memory',
    };
  }

  return {
    title: 'Sign in to BrandOS',
    subtitle: 'Return to your existing workspace and pick up where your team left off.',
    switchLabel: 'Need to create a new workspace?',
    switchCta: 'Create workspace',
    nextStep: 'Next: continue into your workspace',
  };
}

export function getPostAuthRoute(user) {
  if (needsWorkspaceProfileCompletion(user)) {
    return '/auth/complete-profile';
  }

  return user?.onboardingComplete ? '/dashboard' : '/onboarding/team';
}
