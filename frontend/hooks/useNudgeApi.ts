import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

interface NudgeRequest {
  message: string;
  context?: {
    deviceInfo?: {
      type?: string;
      os?: string;
      browser?: string;
    };
    location?: {
      country?: string;
      timezone?: string;
    };
    [key: string]: any;
  };
}

interface NudgeResponse {
  nudge: string;
  confidence?: number;
  suggestedActions?: Array<{
    text: string;
    type: 'link' | 'button' | 'suggestion';
    url?: string;
  }>;
}

interface UseNudgeApiReturn {
  loading: boolean;
  error: string | null;
  sendNudge: (message: string, context?: Record<string, any>) => Promise<NudgeResponse>;
}

export function useNudgeApi(): UseNudgeApiReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession() as { data: Session | null };

  const sendNudge = useCallback(async (
    message: string, 
    context: Record<string, any> = {}
  ): Promise<NudgeResponse> => {
    if (!session?.user?.accessToken) {
      throw new Error('User not authenticated or missing access token');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nudge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          message,
          context: {
            ...context,
            deviceInfo: getDeviceInfo(),
            location: await getLocationInfo(),
            userId: session.user.id,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get nudge');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);

  return { loading, error, sendNudge };
}

// Helper functions
function getDeviceInfo() {
  if (typeof window === 'undefined') return {};
  
  const userAgent = navigator.userAgent;
  return {
    type: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent) 
      ? 'mobile' 
      : 'desktop',
    os: getOS(),
    browser: getBrowser(),
  };
}

function getOS() {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac OS X/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent)) return 'Linux';
  if (/Android/.test(userAgent)) return 'Android';
  if (/iOS|iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
  return 'unknown';
}

function getBrowser() {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) return 'Safari';
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('Edge') > -1) return 'Edge';
  if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'Internet Explorer';
  return 'unknown';
}

async function getLocationInfo() {
  try {
    // Using the browser's built-in geolocation API
    if (navigator.geolocation) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      // Note: In a production app, you'd want to use a reverse geocoding service
      // to convert coordinates to location names
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    }
  } catch (error) {
    console.warn('Could not get geolocation:', error);
  }
  
  // Fallback to timezone detection
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return { timezone };
  } catch (error) {
    console.warn('Could not detect timezone:', error);
    return {};
  }
}
