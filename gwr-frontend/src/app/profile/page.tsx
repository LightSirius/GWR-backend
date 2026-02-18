'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 백엔드에서 반환되는 사용자 정보의 타입을 정의합니다.
// 실제 백엔드 응답에 맞게 필드를 조정해야 합니다.
interface UserProfile {
  user_uuid: string;
  auth_id?: string; // 로컬 로그인 사용자의 경우
  user_email: string;
  user_name?: string;
  auth_type?: string; // 예: LOCAL, NAVER_SNS
  // 백엔드의 JwtStrategy validate() 메소드가 반환하는 객체에 맞춰 필드를 정의해야 합니다.
  // 예를 들어, User 엔티티의 일부 또는 전체를 포함할 수 있습니다.
  // 만약 UserAuth 정보도 포함한다면 auth_type, auth_id 등을 여기에 정의합니다.
  // User 엔티티의 user_nick 필드가 있다면 user_name 대신 또는 추가로 사용할 수 있습니다.
}

const ProfilePage = () => {
  const { isAuthenticated, accessToken, isLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login'); // 비로그인 시 로그인 페이지로 리다이렉트
    }

    if (isAuthenticated && accessToken) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`${backendApiUrl}/auth/login`, { // 사용자 정보 가져오기 API
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              // 토큰 만료 또는 무효 처리
              logout(); // 컨텍스트에서 로그아웃 처리
              router.replace('/login?session_expired=true');
              throw new Error('Session expired. Please login again.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch profile');
          }

          const data: UserProfile = await response.json();
          setProfile(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred while fetching profile.');
          }
          console.error('Fetch profile error:', err);
        }
      };

      fetchProfile();
    }
  }, [isAuthenticated, accessToken, isLoading, router, backendApiUrl, logout]);

  if (isLoading || !isAuthenticated) {
    // 로딩 중이거나 아직 인증 상태가 확정되지 않았거나, 리다이렉션이 처리되기 전
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p>{error}</p>
        <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            Go to Homepage
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  // 린터 오류 수정을 위해 displayProfile 로직 변경
  // GET /auth/login API 응답이 UserProfile 타입과 직접 호환된다고 가정합니다.
  const displayProfile: UserProfile = profile;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>
      <div className="bg-gray-800 shadow-xl rounded-lg p-6">
        <div className="mb-4">
          <p className="text-gray-400 text-sm">User UUID:</p>
          <p className="text-white text-lg">{displayProfile.user_uuid}</p>
        </div>
        {displayProfile.auth_id && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Login ID:</p>
            <p className="text-white text-lg">{displayProfile.auth_id}</p>
          </div>
        )}
        <div className="mb-4">
          <p className="text-gray-400 text-sm">Email:</p>
          <p className="text-white text-lg">{displayProfile.user_email}</p>
        </div>
        {displayProfile.user_name && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Name/Nickname:</p>
            <p className="text-white text-lg">{displayProfile.user_name}</p>
          </div>
        )}
        {displayProfile.auth_type && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Login Type:</p>
            <p className="text-white text-lg">{displayProfile.auth_type}</p>
          </div>
        )}
        {/* 다른 프로필 정보들도 여기에 추가 ... */}

        {/* TODO: Add links/buttons for profile modification, password change, etc. */}
      </div>
    </div>
  );
};

export default ProfilePage; 