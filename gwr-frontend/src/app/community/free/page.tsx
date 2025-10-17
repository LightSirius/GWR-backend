'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageTitle from '@/components/layout/SubPageTitle';
import SubPageLogin from '@/components/layout/SubPageLogin';
import {
  ButtonGroup,
  IconButton,
  Pagination,
  Skeleton,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
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

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchType, setSearchType] = useState<number>(0); // 0: 제목, 1: 내용, 2: 작성자
  const [sortType, setSortType] = useState<number>(0); // 0: 최신순, 1: 점수순

  const fetchPosts = async (params: BoardSearchParams) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/board/search`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) throw new Error('게시글을 불러오는데 실패했습니다.');

      const data: BoardSearchResponse = await response.json();
      setPosts(data.board_summary);
      setTotalPosts(data.total_count || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const searchParams: BoardSearchParams = {
      board_type: 0,
      board_category: 0,
      search_page: 1,
      search_size: 10,
      sort_type: sortType,
    };

    if (searchTerm.trim()) {
      searchParams.search_string = searchTerm.trim();
      searchParams.search_type = searchType;
    }

    setCurrentPage(1);
    fetchPosts(searchParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const searchParams: BoardSearchParams = {
      board_type: 0,
      board_category: 0,
      search_page: page,
      search_size: 10,
      sort_type: sortType,
    };

    if (searchTerm.trim()) {
      searchParams.search_string = searchTerm.trim();
      searchParams.search_type = searchType;
    }

    fetchPosts(searchParams);
  };

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
    <div className="subWrap">
      <div className="inner">
        <div className="left">
          <SubPageTitle
            title="자유게시판"
            firstDepth="커뮤니티"
            titleUri="/community/free"
          />

          {/* 테이블 */}
          <div className="tblComponent">
            <table>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '65%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>조회</th>
                  <th>날짜</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="agnC">
                        <Skeleton height="16px" width="24px" mx="auto" />
                      </td>
                      <td>
                        <Skeleton height="16px" width="100%" />
                      </td>
                      <td className="agnC">
                        <Skeleton height="16px" width="60px" mx="auto" />
                      </td>
                      <td className="agnC">
                        <Skeleton height="16px" width="30px" mx="auto" />
                      </td>
                      <td className="agnC">
                        <Skeleton height="16px" width="70px" mx="auto" />
                      </td>
                    </tr>
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.board_id}>
                      <td className="agnC">{post.board_id}</td>
                      <td>
                        <Link
                          href={`/community/free/${post.board_id}`}
                          className="title"
                        >
                          {post.board_title}
                          {post.comment_count > 0 && (
                            <span className="reply">{post.comment_count}</span>
                          )}
                        </Link>
                      </td>
                      <td className="agnC">{post.user_name}</td>
                      <td className="agnC">{post.view_count}</td>
                      <td className="agnC">
                        {new Date(post.create_date).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="noData">등록된 게시물이 없습니다.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 글쓰기 버튼 */}
          {isAuthenticated && (
            <div className="btnWrap right">
              <Link href="/community/free/write" className="primary">
                글쓰기
              </Link>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination.Root
              count={totalPosts}
              pageSize={itemsPerPage}
              page={currentPage}
              onPageChange={(e) => handlePageChange(e.page)}
              className="pagination"
            >
              <ButtonGroup variant="ghost" size="sm">
                <Pagination.PrevTrigger asChild>
                  <IconButton>
                    <LuChevronLeft />
                  </IconButton>
                </Pagination.PrevTrigger>

                <Pagination.Items
                  render={(page) => (
                    <IconButton
                      variant={{ base: 'ghost', _selected: 'outline' }}
                      key={page.value}
                    >
                      {page.value}
                    </IconButton>
                  )}
                />

                <Pagination.NextTrigger asChild>
                  <IconButton>
                    <LuChevronRight />
                  </IconButton>
                </Pagination.NextTrigger>
              </ButtonGroup>
            </Pagination.Root>
          )}

          {/* 검색영역 */}
          <div className="searchArea">
            <select
              value={sortType}
              onChange={(e) => setSortType(Number(e.target.value))}
            >
              <option value={0}>최신순</option>
              <option value={1}>추천순</option>
            </select>
            <select
              value={searchType}
              onChange={(e) => setSearchType(Number(e.target.value))}
            >
              <option value={0}>제목</option>
              <option value={1}>내용</option>
              <option value={2}>작성자</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>검색</button>
          </div>
        </div>

        <SubPageLogin />
      </div>
    </div>
  );
};

export default FreeBoardPage;
