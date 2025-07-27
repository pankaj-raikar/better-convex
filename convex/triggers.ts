import { Triggers } from 'convex-helpers/server/triggers';

import type { DataModel } from './_generated/dataModel';
import { aggregateUsers } from './aggregates';

// Initialize triggers with DataModel type
export const triggers = new Triggers<DataModel>();

// ===========================================
// AGGREGATE MAINTENANCE TRIGGERS
// ===========================================
// These triggers automatically maintain aggregates when tables change
// No manual aggregate updates needed in mutations!

// Character Stars
triggers.register('users', aggregateUsers.trigger());
