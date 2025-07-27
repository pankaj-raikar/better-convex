import type {
  GenericEnt,
  GenericEntWriter,
  PromiseTableWriter,
} from 'convex-ents';
import type { WithoutSystemFields } from 'convex/server';

import type { Doc, TableNames } from '../_generated/dataModel';
import type { entDefinitions } from '../schema';

export type DocWithId<TableName extends TableNames> = WithoutSystemFields<
  Doc<TableName>
> & {
  id: Doc<TableName>['_id'];
};

// Ent types for read and write operations
export type Ent<TableName extends TableNames> = GenericEnt<
  typeof entDefinitions,
  TableName
>;

export type EntWriter<TableName extends TableNames> = GenericEntWriter<
  typeof entDefinitions,
  TableName
>;

export type EntInsert<TableName extends TableNames> = Parameters<
  Awaited<PromiseTableWriter<TableName, typeof entDefinitions>['insert']>
>[0];

export type EntInsertMany<TableName extends TableNames> = Parameters<
  Awaited<PromiseTableWriter<TableName, typeof entDefinitions>['insertMany']>
>[0];
