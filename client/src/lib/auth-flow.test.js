import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAuthEntryView, getPostAuthRoute, needsWorkspaceProfileCompletion } from './auth-flow.js';

test('needsWorkspaceProfileCompletion depends on explicit profile completion, not inferred company names', () => {
  assert.equal(
    needsWorkspaceProfileCompletion({
      email: 'person@brandos.ai',
      companyName: '',
      workspaceProfileCompleted: false,
    }),
    true
  );

  assert.equal(
    needsWorkspaceProfileCompletion({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
      workspaceProfileCompleted: false,
    }),
    true
  );

  assert.equal(
    needsWorkspaceProfileCompletion({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
      workspaceProfileCompleted: true,
    }),
    false
  );
});

test('getPostAuthRoute prioritises workspace profile completion before onboarding or dashboard', () => {
  assert.equal(
    getPostAuthRoute({
      email: 'person@brandos.ai',
      companyName: '',
      workspaceProfileCompleted: false,
      onboardingComplete: false,
    }),
    '/auth/complete-profile'
  );

  assert.equal(
    getPostAuthRoute({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
      workspaceProfileCompleted: false,
      onboardingComplete: false,
    }),
    '/auth/complete-profile'
  );

  assert.equal(
    getPostAuthRoute({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
      workspaceProfileCompleted: true,
      onboardingComplete: false,
    }),
    '/onboarding/team'
  );

  assert.equal(
    getPostAuthRoute({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
      workspaceProfileCompleted: true,
      onboardingComplete: true,
    }),
    '/dashboard'
  );
});

test('buildAuthEntryView distinguishes creating a new workspace from signing into an existing one', () => {
  assert.deepEqual(buildAuthEntryView('signup'), {
    title: 'Create a BrandOS workspace',
    subtitle: 'Start a new workspace for your team and move into brand setup next.',
    switchLabel: 'Already have a workspace?',
    switchCta: 'Sign in',
    nextStep: 'Next: workspace setup and brand memory',
  });

  assert.deepEqual(buildAuthEntryView('signin'), {
    title: 'Sign in to BrandOS',
    subtitle: 'Return to your existing workspace and pick up where your team left off.',
    switchLabel: 'Need to create a new workspace?',
    switchCta: 'Create workspace',
    nextStep: 'Next: continue into your workspace',
  });
});
