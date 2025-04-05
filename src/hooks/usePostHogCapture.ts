import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';

export function usePostHogCapture(
  event: string,
  properties?: Record<string, any>,
  options?: {
    uuid?: string;
    timestamp?: Date;
    disableGeoip?: boolean;
  }
) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(event, properties, options);
  }, [posthog]);
}
