'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  board_id: number;
  board_title: string;
  user_name: string;
  info_delete: boolean;
  info_block: boolean;
  create_date: Date;
  comment_count: number;
  view_count: number;
  recommend_count: number;
}

interface BoardSearchParams {
  board_type: number;
  board_category: number;
  search_page: number;
  search_string?: string;
  search_type?: number;
  search_size: number;
  sort_type: number;
}

interface BoardSearchResponse {
  total_count: number;
  board_summary: Post[];
}

const FreeBoardPage = () => {
  const { isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchType, setSearchType] = useState<number>(0); // 0: 제목, 1: 내용, 2: 작성자
  const [sortType, setSortType] = useState<number>(0); // 0: 최신순, 1: 점수순

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

  // 게시글 목록 가져오기
  const fetchPosts = async (params: BoardSearchParams) => {
    setIsLoading(true);
    try {
      console.log('API 요청 파라미터:', params);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/board/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      console.log('API 응답 상태:', response.status, response.statusText);
      console.log('API 응답 헤더:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // 응답 본문을 읽어서 상세 오류 정보 확인
        let errorMessage = '게시글을 불러오는데 실패했습니다.';
        try {
          const errorData = await response.text();
          console.error('API 오류 응답 본문:', errorData);
          errorMessage = `API 오류: ${response.status} ${response.statusText}\n${errorData}`;
        } catch (e) {
          console.error('오류 응답 본문 읽기 실패:', e);
        }
        
        throw new Error(errorMessage);
      }

      const data: BoardSearchResponse = await response.json();
      console.log('API 성공 응답:', data);
      
      if (data && data.board_summary && Array.isArray(data.board_summary)) {
        setPosts(data.board_summary);
        setTotalPosts(data.total_count || data.board_summary.length);
      } else {
        console.log('백엔드 응답 구조가 예상과 다름, 기본 데이터 사용:', data);
        // 응답이 예상과 다른 경우 기본 데이터 사용
        setPosts(getDefaultPosts());
        setTotalPosts(getDefaultPosts().length);
      }
    } catch (error) {
      console.error('게시글 로딩 오류:', error);
      // 에러 발생 시 기본 데이터 사용
      setPosts(getDefaultPosts());
      setTotalPosts(getDefaultPosts().length);
    } finally {
      setIsLoading(false);
    }
  };

  // 기본 샘플 데이터 (API 실패 시 사용)
  const getDefaultPosts = (): Post[] => [
    {
      board_id: 1,
      board_title: '오늘 게임하면서 느낀 점',
      user_name: '게이머1',
      info_delete: false,
      info_block: false,
      create_date: new Date('2025-01-27'),
      comment_count: 8,
      view_count: 156,
      recommend_count: 23
    },
    {
      board_id: 2,
      board_title: '새로운 캐릭터 추천해주세요',
      user_name: '뉴비',
      info_delete: false,
      info_block: false,
      create_date: new Date('2025-01-27'),
      comment_count: 12,
      view_count: 89,
      recommend_count: 5
    },
    {
      board_id: 3,
      board_title: '길드원 모집합니다!',
      user_name: '길드장',
      info_delete: false,
      info_block: false,
      create_date: new Date('2025-01-26'),
      comment_count: 6,
      view_count: 234,
      recommend_count: 15
    },
    {
      board_id: 4,
      board_title: '게임 팁 공유',
      user_name: '고수님',
      info_delete: false,
      info_block: false,
      create_date: new Date('2025-01-26'),
      comment_count: 15,
      view_count: 567,
      recommend_count: 45
    },
    {
      board_id: 5,
      board_title: '버그 발견했습니다',
      user_name: '버그헌터',
      info_delete: false,
      info_block: false,
      create_date: new Date('2025-01-25'),
      comment_count: 9,
      view_count: 123,
      recommend_count: 8
    },
    {
      board_id: 6,
      board_title: '오늘의 게임 일기',
      user_name: '일기장',
      info_delete: false,
      info_block: false,
      create_date: new Date('2025-01-25'),
      comment_count: 4,
      view_count: 78,
      recommend_count: 12
    }
  ];

  // 검색 실행
  const handleSearch = () => {
    // search_type이 0(제목)이 아닐 때는 검색어가 필요
    if (searchType !== 0 && !searchTerm.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    const searchParams: BoardSearchParams = {
      board_type: 0,
      board_category: 0,
      search_page: 1,
      search_size: 10,
      sort_type: sortType,
    };

    // 검색어가 있을 때만 search_string과 search_type 추가
    if (searchTerm.trim()) {
      searchParams.search_string = searchTerm.trim();
      searchParams.search_type = searchType;
    }
    
    setCurrentPage(1);
    fetchPosts(searchParams);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const searchParams: BoardSearchParams = {
      board_type: 0,
      board_category: 0,
      search_page: page,
      search_size: 10,
      sort_type: sortType,
    };

    // 검색어가 있을 때만 search_string과 search_type 추가
    if (searchTerm.trim()) {
      searchParams.search_string = searchTerm.trim();
      searchParams.search_type = searchType;
    }

    fetchPosts(searchParams);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const searchParams: BoardSearchParams = {
      board_type: 0,
      board_category: 0,
      search_page: 1,
      search_size: 10,
      sort_type: 0,
    };
    fetchPosts(searchParams);
  }, []);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  return (
    <div className="min-h-screen text-white pt-32">
      {/* Background Overlay */}
      {/* <div className="absolute inset-0 bg-black/50 z-10"></div> */}
      
      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            자유게시판
          </h1>
          <p className="text-gray-300">
            자유롭게 이야기를 나누는 공간입니다
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
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={"검색어를 입력하세요"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                검색
              </button>

              {/* Write Button */}
              {isAuthenticated && (
                <Link href="/community/free/write" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  글쓰기
                </Link>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search Type */}
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">검색 범위:</span>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(Number(e.target.value))}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>내용</option>
                  <option value={1}>제목</option>
                  <option value={2}>작성자</option>
                </select>
              </div>

              {/* Sort Type */}
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">정렬:</span>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(Number(e.target.value))}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>최신순</option>
                  <option value={1}>점수순</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">게시글을 불러오는 중...</p>
          </div>
        )}

        {/* Post List */}
        {!isLoading && (
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
                <div className="col-span-1">번호</div>
                <div className="col-span-6">제목</div>
                <div className="col-span-2">작성자</div>
                <div className="col-span-1">조회</div>
                <div className="col-span-1">추천</div>
                <div className="col-span-1">날짜</div>
              </div>
            </div>

            {/* Post Items */}
            <div className="divide-y divide-gray-700">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Link
                    key={post.board_id}
                    href={`/community/free/${post.board_id}`}
                    className="block px-6 py-4 hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center text-sm">
                      <div className="col-span-1 text-gray-400">
                        {post.board_id}
                      </div>
                      <div className="col-span-6">
                        <div className="flex items-center gap-2">
                          {post.recommend_count > 20 && (
                            <span className="text-red-400 text-xs bg-red-900/50 px-2 py-1 rounded">HOT</span>
                          )}
                          {new Date().getTime() - new Date(post.create_date).getTime() < 24 * 60 * 60 * 1000 && (
                            <span className="text-green-400 text-xs bg-green-900/50 px-2 py-1 rounded">NEW</span>
                          )}
                          <span className="text-white hover:text-blue-400 transition-colors">
                            {post.board_title}
                          </span>
                          {post.comment_count > 0 && (
                            <span className="text-blue-400 text-xs">[{post.comment_count}]</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-gray-400">
                        {post.user_name}
                      </div>
                      <div className="col-span-1 text-gray-400">
                        {post.view_count.toLocaleString()}
                      </div>
                      <div className="col-span-1 text-gray-400">
                        {post.recommend_count}
                      </div>
                      <div className="col-span-1 text-gray-400">
                        {new Date(post.create_date).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-400">
                  {searchTerm ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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

export default FreeBoardPage;
