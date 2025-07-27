import { TableAggregate } from '@convex-dev/aggregate';

import type { DataModel } from './_generated/dataModel';

import { components } from './_generated/api';

// Aggregate for users
export const aggregateUsers = new TableAggregate<{
  DataModel: DataModel;
  Key: null; // No sorting, just counting
  Namespace: string; // userId
  TableName: 'users';
}>(components.aggregateUsers, {
  namespace: (doc) => doc._id,
  sortKey: () => null, // We only care about counting, not sorting
});
