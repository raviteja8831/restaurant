
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { DEFAULT_LANDING_PAGE } from './landingConfig';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Use env/config for landing page, fallback to /login
    const envLanding = Constants.expoConfig?.extra?.DEFAULT_LANDING_PAGE;
    const landing = envLanding || DEFAULT_LANDING_PAGE;
    router.replace(landing);
  }, [router]);

  return null; // Don't render anything since we're redirecting
}