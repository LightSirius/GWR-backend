'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const [authId, setAuthId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState(''); // 닉네임
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);

  const router = useRouter();
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

  const handleIdCheck = async () => {
    if (!authId) {
      setIdCheckMessage('아이디를 입력해주세요.');
      setIsIdAvailable(false);
      return;
    }
    
    setIsCheckingId(true);
    try {
      const response = await fetch(`${backendApiUrl}/user/validate/id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_id: authId }),
      });
      const isAvailable = await response.json(); // 백엔드는 boolean (true: 사용 가능, false: 중복)을 반환한다고 가정
      setIsIdAvailable(isAvailable);
      setIdCheckMessage(isAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.');
    } catch (err) {
      setIsIdAvailable(false);
      setIdCheckMessage('아이디 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('ID check error:', err);
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    if (isIdAvailable === false || authId === '') {
        setError('아이디 중복확인을 완료해주세요.');
        setIsLoading(false);
        return;
    }

    // 비밀번호 강도 검증
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
    if (!passwordRegex.test(password)) {
      setError('비밀번호는 8-20자, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendApiUrl}/user/registration`, { // 백엔드에 이 API 필요
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // auth_id: authId,
          // auth_password: password,
          // user_email: email,
          // user_name: userName,
          user_name: userName,
          user_gender: true,
          user_born: new Date().toISOString(),
          user_email: email,
          user_ci: "test-string-ci",
          phone_number: "010-1234-5678",
          phone_sns_agree: true,
          phone_sns_agree_date: new Date().toISOString(),
          auth_type: 0,
          auth_id: authId,
          auth_password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed and could not parse error response' }));
        throw new Error(errorData.message || 'Registration failed');
      }

      // const data = await response.json(); // 성공 시 특별한 데이터 반환이 없을 수도 있음
      setSuccessMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      // Optionally redirect to login page after a delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('회원가입 중 알 수 없는 오류가 발생했습니다.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white pt-32">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Main Content */}
      <div className="relative z-20 w-full max-w-lg mx-4">
        {/* Register Card */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-purple-600 p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">GWR 회원가입</h1>
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

            {successMessage && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
                <p className="text-green-300 text-sm text-center">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Input with Check Button */}
              <div className="space-y-2">
                <label htmlFor="authId" className="block text-sm font-medium text-gray-300">
                  아이디
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      id="authId"
                      name="authId"
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all duration-200"
                      placeholder="아이디를 입력하세요"
                      value={authId}
                      onChange={(e) => {
                        setAuthId(e.target.value);
                        setIsIdAvailable(null); // ID 변경 시 중복확인 상태 초기화
                        setIdCheckMessage(null);
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full opacity-20"></div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleIdCheck}
                    disabled={isCheckingId || !authId}
                    className="px-4 py-3 border border-green-600 text-sm font-medium rounded-lg text-green-400 hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isCheckingId ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                    ) : (
                      '중복확인'
                    )}
                  </button>
                </div>
                {idCheckMessage && (
                  <p className={`text-xs ${isIdAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {idCheckMessage}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  이메일
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all duration-200"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-5 h-5 bg-blue-500 rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="userName" className="block text-sm font-medium text-gray-300">
                  이름
                </label>
                <div className="relative">
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all duration-200"
                    placeholder="닉네임을 입력하세요"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-5 h-5 bg-purple-500 rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all duration-200"
                    placeholder="비밀번호를 입력하세요 (8-20자, 영문 대소문자, 숫자, 특수문자)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all duration-200"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || isIdAvailable !== true}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      회원가입 중...
                    </>
                  ) : (
                    '회원가입'
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 border-t border-gray-700 pt-6">
              <p className="text-center text-sm text-gray-400 mb-4">
                이미 계정이 있으신가요?
              </p>
              <Link 
                href="/login" 
                className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-all duration-200"
              >
                로그인하기
              </Link>
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

export default RegisterPage; 