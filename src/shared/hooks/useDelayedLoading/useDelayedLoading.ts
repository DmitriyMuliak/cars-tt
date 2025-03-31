import { useEffect, useState } from 'react';

export function useDelayedLoading(isLoading: boolean, delay = 250): boolean {
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => setIsDelayed(true), delay);

    return () => {
      clearTimeout(timer);
      setIsDelayed(false);
    };
  }, [isLoading, delay]);

  return isLoading && isDelayed;
}
