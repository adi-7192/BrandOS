import test from 'node:test';
import assert from 'node:assert/strict';

import { getPostAuthRoute, needsWorkspaceProfileCompletion } from './auth-flow.js';

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
