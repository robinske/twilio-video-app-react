import { useCallback, useState, useEffect } from 'react';

export function checkOtp(phone: any, otp: string) {
  const params = new window.URLSearchParams({ phoneNumber: phone, otp: otp });
  return fetch(`/check?${params}`).then(res => res.text());
}

export default function useVerifyAuth() {
  const [user, setUser] = useState<{ displayName: undefined; photoURL: undefined } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const getToken = useCallback(async (identity: string, roomName: string) => {
    const headers = new window.Headers();
    const params = new window.URLSearchParams({ identity, roomName });

    return fetch(`/token?${params}`, { headers }).then(res => res.text());
  }, []);

  useEffect(() => {
    setIsAuthReady(true);
  }, []);

  const sendOtp = useCallback((phoneNumber: string) => {
    setPhoneNumber(phoneNumber);

    const params = new window.URLSearchParams({ phoneNumber });
    return fetch(`/start?${params}`).then(res => res.text());
  }, []);

  const signIn = useCallback(
    (passcode: string) => {
      return checkOtp(phoneNumber, passcode).then(status => {
        if (status === 'approved') {
          // TODO set some kind of session variable?
          setUser({ passcode } as any);
        } else {
          throw new Error('Invalid code, please try again.');
        }
      });
    },
    [phoneNumber]
  );

  const signOut = useCallback(() => {
    console.log('signing out!');
    setUser(null);
    return Promise.resolve();
  }, []);

  return { user, isAuthReady, getToken, signIn, signOut, sendOtp };
}
