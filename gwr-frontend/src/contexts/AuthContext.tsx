'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태

  useEffect(() => {
    // 앱 시작 시 localStorage에서 토큰 확인
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setAccessToken(storedToken);
        setIsAuthenticated(true);
        // TODO: 여기에 토큰 유효성 검증 API 호출 로직 추가 (선택 사항)
        // 예: fetch('/api/auth/validate-token', { headers: { Authorization: `Bearer ${storedToken}` }})
        //      .then(res => res.ok ? setIsAuthenticated(true) : logout());
      }
    } catch (error) {
      console.error("Error reading token from localStorage", error);
      // localStorage 접근 불가 시 (예: SSR 또는 보안 설정)
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      localStorage.setItem('accessToken', token);
      setAccessToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error saving token to localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      setIsAuthenticated(false);
      // TODO: Call backend logout endpoint if necessary
      // router.push('/login'); // 필요시 로그인 페이지로 리다이렉트
    } catch (error) {
      console.error("Error removing token from localStorage", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 