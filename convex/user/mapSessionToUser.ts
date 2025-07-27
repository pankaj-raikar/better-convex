import type { Ent } from '../shared/types';

import type { Doc, Id } from '../_generated/dataModel';

export type SessionUser = Doc<'users'> & {
  id: Id<'users'>;
};

export const mapSessionToUser = (
  user: Ent<'users'>
): Ent<'users'> & SessionUser => {
  return {
    ...user,
    id: user._id,
    doc: user.doc,
    edge: user.edge,
    edgeX: user.edgeX,
  };
};
