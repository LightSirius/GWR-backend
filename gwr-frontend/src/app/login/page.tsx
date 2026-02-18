'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // 시간에 따른 배경 이미지 결정
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const isDay = hour >= 8 && hour < 20; // 8시부터 20시(저녁 8시)까지는 낮
      
      setCurrentTime(now);
      setIsDaytime(isDay);
    };

    // 초기 실행
    updateTime();

    // 1분마다 시간 업데이트 (배경 변경을 위해)
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // body에 배경 클래스 적용
  useEffect(() => {
    const body = document.body;
    
    // 기존 클래스 제거
    body.classList.remove('daytime', 'nighttime');
    
    // 새로운 클래스 추가
    if (isDaytime !== null) {
      body.classList.add(isDaytime ? 'daytime' : 'nighttime');
    }
  }, [isDaytime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${backendApiUrl}/auth/login/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auth_id: email, auth_password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed and could not parse error response' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      if (data.access_token) {
        login(data.access_token);
        router.push('/');
      } else {
        throw new Error('Access token not found in login response');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during local login');
      }
      console.error('Local login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white pt-32">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Main Content */}
      <div className="relative z-20 w-full max-w-md mx-4">
        {/* Login Card */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-purple-600 p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">GWR 로그인</h1>
            <p className="text-green-100 text-sm">
              게임 웹 페이지 리뉴얼 프로젝트
            </p>
            {currentTime && (
              <p className="text-xs text-green-200 mt-2">
                {isDaytime ? '☀️ 낮 모드' : '🌙 밤 모드'} - {currentTime.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </p>
            )}
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  아이디
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="auth_id"
                    type="text"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all duration-200"
                    placeholder="아이디를 입력하세요"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all duration-200"
                    placeholder="비밀번호를 입력하세요"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-5 h-5 bg-purple-500 rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      로그인 중...
                    </>
                  ) : (
                    '로그인'
                  )}
                </button>
              </div>
            </form>

            {/* Additional Links */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-400 hover:text-gray-300 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500" />
                  로그인 상태 유지
                </label>
                <Link href="/forgot-password" className="text-green-400 hover:text-green-300 transition-colors">
                  비밀번호 찾기
                </Link>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <p className="text-center text-sm text-gray-400 mb-4">
                  아직 계정이 없으신가요?
                </p>
                <Link 
                  href="/register" 
                  className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-all duration-200"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 GWR Game Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 