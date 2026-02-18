'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NaverCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Processing Naver login...');

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Invalid Naver callback: code or state parameter is missing.');
      setMessage('Login failed. Please try again.');
      // Optionally redirect to login page after a delay
      // setTimeout(() => router.push('/login'), 3000);
      return;
    }

    const processNaverLogin = async () => {
      try {
        const response = await fetch(`${backendApiUrl}/auth/login/sns/naver`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Naver login processing failed on server');
        }

        const data = await response.json();
        console.log('Naver login successful:', data);
        if (data.accessToken) {
          login(data.accessToken);
          setMessage('Login successful! Redirecting...');
          router.push('/');
        } else {
          throw new Error('Access token not found in Naver login response');
        }

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred during Naver login processing.');
        }
        setMessage('Login failed. Please try again.');
        console.error('Naver login processing error:', err);
        // Optionally redirect to login page after a delay
        // setTimeout(() => router.push('/login'), 3000);
      }
    };

    processNaverLogin();
  }, [searchParams, router, backendApiUrl, login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Naver Login</h1>
        <p className="mb-2">{message}</p>
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
        {!error && !message.includes('Redirecting') && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm">Please wait...</p>
          </div>
        )}
        {message.includes('Login failed') && (
            <button 
                onClick={() => router.push('/login')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
                Back to Login
            </button>
        )}
      </div>
    </div>
  );
};

export default NaverCallbackPage; 