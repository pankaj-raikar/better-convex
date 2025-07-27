import { getSessionUser } from './auth';
import { createInternalQuery } from './functions';

export const sessionUser = createInternalQuery()({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);

    if (!user) {
      return null;
    }

    return user.doc();
  },
});
