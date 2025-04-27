import { useEffect, useRef } from 'react';

/**
 * A hook that tracks whether a component is mounted.
 * Useful for preventing state updates after unmounting and handling cleanup.
 *
 * @returns A ref object with a current boolean value indicating if the component is mounted
 */
export function useIsMounted() {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}
