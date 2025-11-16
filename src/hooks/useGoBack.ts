import { useRouter } from 'next/navigation';

const useGoBack = () => {
  const router = useRouter();

  const goBack = () => {
    // Simply use router.back() - Next.js router handles the navigation safely
    // If there's no history, the user stays on the current page
    router.back();
  };

  return goBack;
};

export default useGoBack;
