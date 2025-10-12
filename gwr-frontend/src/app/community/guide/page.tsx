'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GuidePost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  category: '초보자' | '중급자' | '고급자' | '던전' | 'PvP' | '직업';
  difficulty: 1 | 2 | 3 | 4 | 5;
  isHot?: boolean;
  isNew?: boolean;
  isSticky?: boolean;
}

const GuidePage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<GuidePost[]>([
    {
      id: 1,
      title: '초보자를 위한 게임 시작 가이드',
      content: '게임을 처음 시작하는 분들을 위한 상세한 가이드입니다. 기본 조작법부터 레벨업 팁까지!',
      author: '가이드마스터',
      date: '2025-01-27',
      views: 1234,
      likes: 156,
      comments: 23,
      category: '초보자',
      difficulty: 1,
      isHot: true,
      isSticky: true
    },
    {
      id: 2,
      title: '던전 클리어 공략 - 어둠의 탑',
      content: '어둠의 탑 던전을 클리어하는 상세한 공략입니다. 보스 패턴과 파티 구성까지!',
      author: '던전러너',
      date: '2025-01-27',
      views: 567,
      likes: 78,
      comments: 15,
      category: '던전',
      difficulty: 4,
      isNew: true
    },
    {
      id: 3,
      title: 'PvP 승률 높이는 팁',
      content: 'PvP에서 승률을 높이는 실전 팁들을 공유합니다. 스킬 활용과 타이밍이 중요해요!',
      author: 'PvP고수',
      date: '2025-01-26',
      views: 789,
      likes: 92,
      comments: 18,
      category: 'PvP',
      difficulty: 3,
      isHot: true
    },
    {
      id: 4,
      title: '전사 직업 완벽 가이드',
      content: '전사 직업의 스킬 트리와 장비 세팅, 그리고 최적의 플레이 스타일을 소개합니다.',
      author: '직업전문가',
      date: '2025-01-26',
      views: 456,
      likes: 67,
      comments: 12,
      category: '직업',
      difficulty: 2
    },
    {
      id: 5,
      title: '중급자를 위한 효율적인 레벨업',
      content: '중급자들이 효율적으로 레벨업할 수 있는 방법들을 정리했습니다.',
      author: '레벨업러',
      date: '2025-01-25',
      views: 234,
      likes: 34,
      comments: 8,
      category: '중급자',
      difficulty: 2
    },
    {
      id: 6,
      title: '고급자 전용 숨겨진 던전 공략',
      content: '고급자만이 도전할 수 있는 숨겨진 던전의 공략입니다. 매우 어려우니 주의하세요!',
      author: '하드코어러',
      date: '2025-01-25',
      views: 345,
      likes: 45,
      comments: 9,
      category: '고급자',
      difficulty: 5
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

  const categories = ['전체', '초보자', '중급자', '고급자', '던전', 'PvP', '직업'];

  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === '전체' || post.category === selectedCategory;
    const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '초보자': return 'bg-green-600';
      case '중급자': return 'bg-blue-600';
      case '고급자': return 'bg-purple-600';
      case '던전': return 'bg-red-600';
      case 'PvP': return 'bg-yellow-600';
      case '직업': return 'bg-indigo-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  return (
    <div className="min-h-screen text-white pt-32">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            공략게시판
          </h1>
          <p className="text-gray-300">
            게임 공략과 팁을 공유하는 공간입니다
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

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Write Button */}
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              공략 작성
            </button>
          </div>
        </div>

        {/* Guide List */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
              <div className="col-span-1">번호</div>
              <div className="col-span-2">분류</div>
              <div className="col-span-4">제목</div>
              <div className="col-span-1">난이도</div>
              <div className="col-span-2">작성자</div>
              <div className="col-span-1">조회</div>
              <div className="col-span-1">날짜</div>
            </div>
          </div>

          {/* Guide Items */}
          <div className="divide-y divide-gray-700">
            {paginatedPosts.length > 0 ? (
              paginatedPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/community/guide/${post.id}`}
                  className={`block px-6 py-4 hover:bg-gray-800/50 transition-colors duration-200 ${
                    post.isSticky ? 'bg-yellow-900/20' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-1 text-gray-400">
                      {post.isSticky ? (
                        <span className="text-yellow-400">📌</span>
                      ) : (
                        startIndex + index + 1
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        {post.isSticky && (
                          <span className="text-yellow-400 text-xs">[공지]</span>
                        )}
                        {post.isHot && (
                          <span className="text-red-400 text-xs bg-red-900/50 px-2 py-1 rounded">HOT</span>
                        )}
                        {post.isNew && (
                          <span className="text-green-400 text-xs bg-green-900/50 px-2 py-1 rounded">NEW</span>
                        )}
                        <span className="text-white hover:text-green-400 transition-colors">
                          {post.title}
                        </span>
                        {post.comments > 0 && (
                          <span className="text-green-400 text-xs">[{post.comments}]</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 text-yellow-400 text-xs">
                      {getDifficultyStars(post.difficulty)}
                    </div>
                    <div className="col-span-2 text-gray-400">
                      {post.author}
                    </div>
                    <div className="col-span-1 text-gray-400">
                      {post.views.toLocaleString()}
                    </div>
                    <div className="col-span-1 text-gray-400">
                      {post.date}
                    </div>
                  </div>
                </Link>
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

export default GuidePage;
