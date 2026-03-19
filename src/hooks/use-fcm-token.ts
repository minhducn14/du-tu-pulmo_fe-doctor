import { useEffect, useState } from 'react';
import { getMessaging, onMessage } from 'firebase/messaging';
import { requestForToken } from '@/config/firebase';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

let _fcmTokenSingleton: string | null = null;
export const getFcmToken = () => _fcmTokenSingleton;

export const clearFcmToken = () => {
  _fcmTokenSingleton = null;
};

export const useFcmToken = (isAuthenticated: boolean) => {
  const [fcmToken, setFcmToken] = useState<string | null>(_fcmTokenSingleton);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      setFcmToken(null);
      return;
    }

    let cancelled = false;

    const fetchToken = async () => {
      try {
        if (_fcmTokenSingleton) {
          setFcmToken(_fcmTokenSingleton);
          return;
        }

        const token = await requestForToken();
        if (token && !cancelled) {
          _fcmTokenSingleton = token;
          setFcmToken(token);
          await authService.addFcmToken(token);
        }
      } catch (error) {
        console.error('Failed to fetch FCM token:', error);
      }
    };

    fetchToken();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!fcmToken) return;

    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      toast(payload?.notification?.title || payload?.data?.title || 'Thông báo mới', {
        description: payload?.notification?.body || payload?.data?.body
      });

      // Invalidate notification queries to update UI in "real-time"
      queryClient.invalidateQueries({ 
        queryKey: ['notifications'],
        refetchType: 'all' 
      });
    });

    return () => unsubscribe();
  }, [fcmToken, queryClient]);

  return { fcmToken };
};