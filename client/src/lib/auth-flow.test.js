import test from 'node:test';
import assert from 'node:assert/strict';

import { getPostAuthRoute, needsWorkspaceProfileCompletion } from './auth-flow.js';

test('needsWorkspaceProfileCompletion requires company info for incomplete workspace profiles', () => {
  assert.equal(
    needsWorkspaceProfileCompletion({
      email: 'person@brandos.ai',
      companyName: '',
    }),
    true
  );

  assert.equal(
    needsWorkspaceProfileCompletion({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
    }),
    false
  );
});

test('getPostAuthRoute prioritises workspace profile completion before onboarding or dashboard', () => {
  assert.equal(
    getPostAuthRoute({
      email: 'person@brandos.ai',
      companyName: '',
      onboardingComplete: false,
    }),
    '/auth/complete-profile'
  );

  assert.equal(
    getPostAuthRoute({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
      onboardingComplete: false,
    }),
    '/onboarding/team'
  );

  assert.equal(
    getPostAuthRoute({
      email: 'person@brandos.ai',
      companyName: 'BrandOS',
      onboardingComplete: true,
    }),
    '/dashboard'
  );
});
