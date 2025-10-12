'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notice {
  id: number;
  type: '공지' | '점검' | '이벤트' | '패치';
  title: string;
  content: string;
  date: string;
  author: string;
  views: number;
  isImportant?: boolean;
}

const NoticePage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: 1,
      type: '공지',
      title: 'GWR Game Portal 오픈 베타 서비스 안내',
      content: '안녕하세요, GWR Game Portal입니다. 오픈 베타 서비스가 시작되었습니다. 많은 관심과 참여 부탁드립니다.',
      date: '2025-01-27',
      author: '관리자',
      views: 1250,
      isImportant: true
    },
    {
      id: 2,
      type: '점검',
      title: '정기 점검 안내 (1월 28일 02:00~06:00)',
      content: '서버 안정화를 위한 정기 점검이 예정되어 있습니다. 점검 시간 동안 서비스 이용이 제한됩니다.',
      date: '2025-01-26',
      author: '시스템관리자',
      views: 890
    },
    {
      id: 3,
      type: '이벤트',
      title: '신규 가입자 환영 이벤트 진행 중!',
      content: '신규 가입자를 위한 특별 이벤트가 진행 중입니다. 다양한 혜택을 놓치지 마세요!',
      date: '2025-01-25',
      author: '이벤트팀',
      views: 567
    },
    {
      id: 4,
      type: '패치',
      title: 'v1.2.0 업데이트 내용 안내',
      content: '새로운 기능과 버그 수정이 포함된 v1.2.0 업데이트가 적용되었습니다.',
      date: '2025-01-24',
      author: '개발팀',
      views: 432
    },
    {
      id: 5,
      type: '공지',
      title: '개인정보 처리방침 개정 안내',
      content: '개인정보 보호법 개정에 따라 개인정보 처리방침이 개정되었습니다.',
      date: '2025-01-23',
      author: '관리자',
      views: 321
    },
    {
      id: 6,
      type: '이벤트',
      title: '겨울 시즌 특별 이벤트',
      content: '겨울 시즌을 맞아 특별한 이벤트가 준비되었습니다. 많은 참여 부탁드립니다.',
      date: '2025-01-22',
      author: '이벤트팀',
      views: 789
    }
  ]);

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

  const noticeTypes = ['전체', '공지', '점검', '이벤트', '패치'];

  const filteredNotices = notices.filter(notice => {
    const typeMatch = selectedType === '전체' || notice.type === selectedType;
    const searchMatch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage);

  const getTypeColor = (type: string) => {
    switch (type) {
      case '공지': return 'bg-red-600';
      case '점검': return 'bg-yellow-600';
      case '이벤트': return 'bg-green-600';
      case '패치': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen text-white pt-32">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent mb-4">
            공지사항
          </h1>
          <p className="text-gray-300">
            GWR Game Portal의 최신 소식을 확인하세요
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

        {/* Search and Filter */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="제목 또는 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {noticeTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notice List */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
              <div className="col-span-1">번호</div>
              <div className="col-span-2">분류</div>
              <div className="col-span-5">제목</div>
              <div className="col-span-2">작성자</div>
              <div className="col-span-1">조회</div>
              <div className="col-span-1">날짜</div>
            </div>
          </div>

          {/* Notice Items */}
          <div className="divide-y divide-gray-700">
            {paginatedNotices.length > 0 ? (
              paginatedNotices.map((notice, index) => (
                <div
                  key={notice.id}
                  className={`px-6 py-4 hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer ${
                    notice.isImportant ? 'bg-red-900/20' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-1 text-gray-400">
                      {startIndex + index + 1}
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(notice.type)}`}>
                        {notice.type}
                      </span>
                    </div>
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        {notice.isImportant && (
                          <span className="text-red-400 text-xs">[중요]</span>
                        )}
                        <span className="text-white hover:text-green-400 transition-colors">
                          {notice.title}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 text-gray-400">
                      {notice.author}
                    </div>
                    <div className="col-span-1 text-gray-400">
                      {notice.views.toLocaleString()}
                    </div>
                    <div className="col-span-1 text-gray-400">
                      {notice.date}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-400">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NoticePage;
