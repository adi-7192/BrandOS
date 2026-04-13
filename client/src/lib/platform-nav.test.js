import test from 'node:test';
import assert from 'node:assert/strict';

import { PLATFORM_NAV_ITEMS } from './platform-nav.js';

test('PLATFORM_NAV_ITEMS keeps the main workspace navigation consistent across shells', () => {
  assert.deepEqual(PLATFORM_NAV_ITEMS, [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/settings/brands', label: 'Brand Kits', end: false },
    { to: '/campaigns', label: 'Campaigns', end: true },
    { to: '/inbox', label: 'Inbox', end: true },
    { to: '/settings', label: 'Settings', end: true },
  ]);
});
