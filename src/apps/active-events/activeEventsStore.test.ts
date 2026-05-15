import assert from 'node:assert/strict';

import { useAppStore } from '../../store';

useAppStore.getState().setActiveEventLastRefreshAt(12345);
assert.equal(useAppStore.getState().activeEventLastRefreshAt, 12345);

useAppStore.getState().setActiveEventLastRefreshAt(0);
assert.equal(useAppStore.getState().activeEventLastRefreshAt, 0);

console.log('active event store ok');
