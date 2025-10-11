'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface WritePostData {
  board_title: string;
  board_contents: string;
  board_contents_es: string;
}

const WritePostPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WritePostData>({
    board_title: '',
    board_contents: '',
    board_contents_es: ''
  });

  // HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
  const stripHtmlTags = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/&nbsp;/g, ' ') // &nbsp;를 공백으로 변환
      .replace(/&amp;/g, '&') // &amp;를 &로 변환
      .replace(/&lt;/g, '<') // &lt;를 <로 변환
      .replace(/&gt;/g, '>') // &gt;를 >로 변환
      .replace(/&quot;/g, '"') // &quot;를 "로 변환
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .trim(); // 앞뒤 공백 제거
  };

  // 시간에 따른 배경 이미지 결정
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const isDay = hour >= 8 && hour < 20;
      
      setCurrentTime(now);
      setIsDaytime(isDay);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // body에 배경 클래스 적용
  useEffect(() => {
    const body = document.body;
    body.classList.remove('daytime', 'nighttime');
    if (isDaytime !== null) {
      body.classList.add(isDaytime ? 'daytime' : 'nighttime');
    }
  }, [isDaytime]);

  // 로그인 상태 확인 및 접근 제어
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중이거나 로그인하지 않은 경우 로딩 화면 표시
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen text-white pt-32">
        <div className="relative z-20 container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">
            {isLoading ? '로딩 중...' : '로그인 확인 중...'}
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // board_contents와 board_contents_es를 동기화
    if (name === 'board_contents') {
      setFormData(prev => ({
        ...prev,
        board_contents: value,
        board_contents_es: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.board_title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.board_contents.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (!accessToken) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/board/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // JWT 토큰 필요
        },
        body: JSON.stringify({
          board_type: 0, // 자유게시판
          board_category: 0,
          board_title: formData.board_title.trim(),
          board_contents: formData.board_contents.trim(),
          board_contents_es: stripHtmlTags(formData.board_contents) // HTML 태그 제거된 순수 텍스트
        }),
      });

      if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`게시글 작성 실패: ${response.status} ${response.statusText}\n${errorData}`);
      }

      const result = await response.json();
      
      console.log('게시글 작성 응답:', result); // 디버깅용 로그 추가
      
      // status가 0(success)이거나 'success'일 때 성공으로 처리
      if (result.status === 0 || result.status === 'success') {
        // 성공 시 알림 없이 바로 해당 게시글로 이동
        router.push(`/community/free/${result.board_id}`);
      } else {
        // 실패 시 구체적인 에러 메시지 표시
        let errorMessage = '게시글 작성 실패';
        if (result.status === 1) {
          errorMessage = 'CUID가 설정되지 않았습니다.';
        } else if (result.status === 2) {
          errorMessage = '게시글 작성에 실패했습니다.';
        } else if (result.status === 3) {
          errorMessage = '시스템 오류가 발생했습니다.';
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      alert(error instanceof Error ? error.message : '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white pt-32">
      {/* 로딩 오버레이 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-xl font-medium text-white mb-2">게시글 작성 중...</p>
            <p className="text-gray-400 text-sm">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            글 작성
          </h1>
          <p className="text-gray-300">
            자유게시판에 새로운 글을 작성합니다
            {currentTime && (
              <span className="block text-sm text-gray-400 mt-2">
                {isDaytime ? '☀️ 낮 모드' : '🌙 밤 모드'} - {currentTime.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </span>
            )}
          </p>
        </div>

        {/* Write Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-6">
              <label htmlFor="board_title" className="block text-sm font-medium text-gray-300 mb-2">
                제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="board_title"
                name="board_title"
                value={formData.board_title}
                onChange={handleInputChange}
                placeholder="게시글 제목을 입력하세요"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={100}
                required
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">
                  최대 100자까지 입력 가능합니다
                </span>
                <span className="text-sm text-gray-400">
                  {formData.board_title.length}/100
                </span>
              </div>
            </div>

            {/* Content Input */}
            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-6">
              <label htmlFor="board_contents" className="block text-sm font-medium text-gray-300 mb-2">
                내용 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="board_contents"
                name="board_contents"
                value={formData.board_contents}
                onChange={handleInputChange}
                placeholder="게시글 내용을 입력하세요"
                rows={15}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                maxLength={5000}
                required
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">
                  최대 5,000자까지 입력 가능합니다
                </span>
                <span className="text-sm text-gray-400">
                  {formData.board_contents.length}/5,000
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Link
                href="/community/free"
                className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                목록으로
              </Link>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      작성 중...
                    </>
                  ) : (
                    '게시글 작성'
                  )}
                </button>
                <Link
                  href="/community/free"
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium transform hover:scale-105"
                >
                  취소
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Writing Tips */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📝 글 작성 팁</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-blue-400 mb-2">제목 작성</h4>
                <ul className="space-y-1">
                  <li>• 명확하고 이해하기 쉬운 제목을 사용하세요</li>
                  <li>• 핵심 내용을 간결하게 표현하세요</li>
                  <li>• 과도한 특수문자 사용을 피하세요</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-400 mb-2">내용 작성</h4>
                <ul className="space-y-1">
                  <li>• 읽기 쉽게 문단을 나누어 작성하세요</li>
                  <li>• 구체적인 예시나 경험을 포함하세요</li>
                  <li>• 다른 사용자와의 소통을 고려하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePostPage;
