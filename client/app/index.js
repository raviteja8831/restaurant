
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
    // Debug log for landing page
    console.log('Redirecting to landing:', landing);
    // Delay navigation to ensure router/layout is mounted
    const timeout = setTimeout(() => {
      console.log('Router replace called with:', landing);
      router.replace(landing);
    }, 200);
    return () => clearTimeout(timeout);
  }, [router]);

  return null; // Don't render anything since we're redirecting
}