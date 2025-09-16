import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Customer-Login screen immediately
    router.replace('/Customer-Login');
  }, []);

  return null; // Don't render anything since we're redirecting
}