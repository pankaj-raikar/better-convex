import { api } from '@convex/_generated/api';

import { useAuthQuery } from '@/lib/convex/hooks';

export const useCurrentUser = () => {
  const { data, isLoading } = useAuthQuery(
    api.user.getCurrentUser,
    {},
    {
      placeholderData: {
        id: '1' as any,
        email: 'better-convex@gmail.com',
        name: undefined,
      },
    }
  );

  return { ...data, isLoading };
};
