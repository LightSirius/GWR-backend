'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GalleryPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  imageUrl: string;
  isHot?: boolean;
  isNew?: boolean;
}

const GalleryPage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<GalleryPost[]>([
    {
      id: 1,
      title: '내 캐릭터 스크린샷',
      content: '오늘 던전 클리어 후 찍은 스크린샷입니다. 정말 멋진 장면이었어요!',
      author: '스크린샷러',
      date: '2025-01-27',
      views: 234,
      likes: 45,
      comments: 12,
      imageUrl: '/api/placeholder/300/200',
      isHot: true
    },
    {
      id: 2,
      title: '아름다운 게임 내 풍경',
      content: '게임 내에서 발견한 아름다운 풍경을 공유합니다.',
      author: '풍경사진가',
      date: '2025-01-27',
      views: 156,
      likes: 23,
      comments: 8,
      imageUrl: '/api/placeholder/300/200',
      isNew: true
    },
    {
      id: 3,
      title: '우리 길드 단체사진',
      content: '길드원들과 함께 찍은 단체사진입니다. 모두가 정말 멋져요!',
      author: '길드장',
      date: '2025-01-26',
      views: 567,
      likes: 67,
      comments: 15
    },
    {
      id: 4,
      title: '레어 아이템 획득!',
      content: '드디어 레어 아이템을 획득했습니다! 정말 기뻐요!',
      author: '행운아',
      date: '2025-01-26',
      views: 789,
      likes: 89,
      comments: 23,
      isHot: true
    },
    {
      id: 5,
      title: 'PvP 승리 스크린샷',
      content: 'PvP에서 승리한 순간을 담았습니다. 정말 짜릿했어요!',
      author: 'PvP마스터',
      date: '2025-01-25',
      views: 345,
      likes: 34,
      comments: 9
    },
    {
      id: 6,
      title: '커스텀 캐릭터',
      content: '나만의 스타일로 꾸민 캐릭터를 공유합니다.',
      author: '패션리더',
      date: '2025-01-25',
      views: 123,
      likes: 18,
      comments: 6
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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 6; // 갤러리는 이미지가 있어서 적게 표시
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen text-white pt-32">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            유저갤러리
          </h1>
          <p className="text-gray-300">
            유저들이 공유하는 게임 스크린샷과 이미지들
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

        {/* Search and Upload */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="제목 또는 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              이미지 업로드
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/community/gallery/${post.id}`}
              className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-800">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {post.isHot && (
                    <span className="text-red-400 text-xs bg-red-900/80 px-2 py-1 rounded">HOT</span>
                  )}
                  {post.isNew && (
                    <span className="text-green-400 text-xs bg-green-900/80 px-2 py-1 rounded">NEW</span>
                  )}
                </div>

                {/* Stats */}
                <div className="absolute bottom-2 right-2 flex gap-2 text-xs text-white">
                  <span className="bg-black/50 px-2 py-1 rounded">👁 {post.views}</span>
                  <span className="bg-black/50 px-2 py-1 rounded">❤️ {post.likes}</span>
                  <span className="bg-black/50 px-2 py-1 rounded">💬 {post.comments}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-medium mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-8">
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
                      ? 'bg-purple-600 text-white'
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
        <div className="text-center">
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

export default GalleryPage;
