export function needsWorkspaceProfileCompletion(user) {
  return !user?.workspaceProfileCompleted;
}

export function getPostAuthRoute(user) {
  if (needsWorkspaceProfileCompletion(user)) {
    return '/auth/complete-profile';
  }

  return user?.onboardingComplete ? '/dashboard' : '/onboarding/team';
}
