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
import { useBoardStore } from '@/app/store/useBoardStore';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/app/store/api';

const FreeBoardPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchType, setSearchType] = useState<number>(0); // 0: 제목, 1: 내용, 2: 작성자
  const [sortType, setSortType] = useState<number>(0); // 0: 최신순, 1: 점수순
  const [searchString, setSearchString] = useState(''); // 검색어

  const { posts, isLoading, totalCount, paging, setPaging, search } =
    useBoardStore();

  // 페이지 로드시 fatch
  useEffect(() => {
    search({
      board_type: 0,
      board_category: 0,
      search_page: paging.curPage,
      search_size: paging.pageRowCount,
      sort_type: 0,
    });
  }, [paging.curPage]);

  // 검색 버튼 동작
  const handleSearch = async () => {
    setPaging({ curPage: 1 }); // 첫 페이지로
    const params: any = {
      board_type: 0,
      board_category: 0,
      search_page: 1,
      search_size: 10,
      sort_type: sortType,
    };

    if (searchString && searchString.trim() !== '') {
      params.search_string = searchString;
      params.search_type = searchType ?? 0;
    }

    await search(params);
  };

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
          <Pagination.Root
            count={totalCount}
            pageSize={paging.pageRowCount}
            page={paging.curPage}
            onPageChange={(e) => setPaging({ curPage: e.page })}
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
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder="검색어를 입력하세요"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
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
