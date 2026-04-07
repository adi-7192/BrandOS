export function needsWorkspaceProfileCompletion(user) {
  return !user?.companyName;
}

export function getPostAuthRoute(user) {
  if (needsWorkspaceProfileCompletion(user)) {
    return '/auth/complete-profile';
  }

  return user?.onboardingComplete ? '/dashboard' : '/onboarding/team';
}
