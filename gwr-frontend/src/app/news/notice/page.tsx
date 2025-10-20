'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageTitle from '@/components/layout/SubPageTitle';
import SubPageLogin from '@/components/layout/SubPageLogin';
import {
  ButtonGroup,
  IconButton,
  Pagination,
  SegmentGroup,
  Spinner,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useNoticeStore } from '@/app/store/useNoticeStore';

const NoticePage = () => {
  // Zustand store 불러오기
  const { notices, totalCount, search, isLoading } = useNoticeStore();

  // 검색 / 필터 / 페이지 상태
  const [noticeType, setNoticeType] = useState(0); // 0: 공지, 1: 점검, 2: 이벤트
  const [sortType, setSortType] = useState(0); // 0: 최신순
  const [searchType, setSearchType] = useState(0); // 0: 제목, 1: 내용
  const [searchString, setSearchString] = useState('');
  const [page, setPage] = useState(0);

  // 페이지 로드 시 또는 필터 변경 시 API 호출
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const params: any = {
          notice_type: noticeType,
          search_page: page,
          search_size: 10,
          sort_type: sortType,
        };

        // 전체 탭이 아니면 notice_type 추가
        if (noticeType !== 0) {
          params.notice_type = noticeType;
        }

        // 검색어가 있으면 search_string, search_type 추가
        if (searchString && searchString.trim() !== '') {
          params.search_string = searchString;
          params.search_type = searchType ?? 0;
        }

        await search(params);
      } catch (err) {
        console.error('공지 불러오기 실패:', err);
      }
    };

    fetchNotices();
  }, [noticeType, page, sortType]);

  // 검색 버튼 클릭 시
  const handleSearch = async () => {
    setPage(0); // 첫 페이지로
    const params: any = {
      notice_type: noticeType,
      search_page: 0,
      search_size: 10,
      sort_type: sortType,
    };

    if (searchString && searchString.trim() !== '') {
      params.search_string = searchString;
      params.search_type = searchType ?? 0;
    }

    await search(params);
  };

  // 탭 선택 시 noticeType 변경
  const handleTabChange = (details: any) => {
    const value = details?.value;
    const map: Record<string, number> = {
      공지사항: 0,
      점검: 1,
      이벤트: 2,
    };
    setNoticeType(map[value] ?? 0);
  };

  return (
    <div className="subWrap">
      <div className="inner">
        <div className="left">
          <SubPageTitle
            title="공지사항"
            firstDepth="새소식"
            titleUri="/news/notice"
          />

          {/* 탭 필터 */}
          <SegmentGroup.Root
            defaultValue="공지사항"
            className="tabWrap"
            onValueChange={handleTabChange}
          >
            <SegmentGroup.Indicator />
            <SegmentGroup.Items items={['공지사항', '점검', '이벤트']} />
          </SegmentGroup.Root>

          {/* ✅ 로딩 표시 */}
          {isLoading && (
            <div className="loadingArea">
              <Spinner size="lg" />
              <p>불러오는 중...</p>
            </div>
          )}

          {/* ✅ 테이블 */}
          {!isLoading && (
            <div className="tblComponent">
              <table>
                <colgroup>
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '65%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>분류</th>
                    <th>제목</th>
                    <th>조회</th>
                    <th>날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.length > 0 ? (
                    notices.map((item) => {
                      const today = new Date().toISOString().split('T')[0];
                      const date = item.create_date?.slice(0, 10);
                      return (
                        <tr key={item.notice_id}>
                          <td className="agnC">{item.notice_id}</td>
                          <td className="agnC">
                            {['공지', '점검', '이벤트'][item.notice_type]}
                          </td>
                          <td>
                            <Link
                              href={`/news/notice/${item.notice_id}`}
                              className="title"
                            >
                              {item.notice_title}
                              {/* NEW 표시 */}
                              {date === today && <span className="new"></span>}
                              {/* 댓글 수 표시 */}
                              {item.comment_count > 0 && (
                                <span className="reply">
                                  {item.comment_count}
                                </span>
                              )}
                            </Link>
                          </td>
                          <td className="agnC">{item.view_count}</td>
                          <td className="agnC">{date ?? '-'}</td>
                        </tr>
                      );
                    })
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
          )}

          {/* 버튼그룹 */}
          <div className="btnWrap right">
            <Link href="/news/notice/write" className="primary">
              글쓰기
            </Link>
          </div>

          {/* ✅ 페이지네이션 */}
          <Pagination.Root
            count={totalCount}
            pageSize={10}
            page={page + 1}
            className="pagination"
            onPageChange={(e) => setPage(e.page - 1)}
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
                    key={page.value}
                    variant={{ base: 'ghost', _selected: 'outline' }}
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

          {/* ✅ 검색 */}
          <div className="searchArea">
            <select
              value={sortType}
              onChange={(e) => setSortType(Number(e.target.value))}
            >
              <option value={0}>최신순</option>
              <option value={1}>정확도순</option>
            </select>
            <select
              value={searchType}
              onChange={(e) => setSearchType(Number(e.target.value))}
            >
              <option value={0}>제목</option>
              <option value={1}>내용</option>
            </select>
            <input
              type="text"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder="검색어를 입력하세요"
            />
            <button onClick={handleSearch}>검색</button>
          </div>
        </div>

        <SubPageLogin />
      </div>
    </div>
  );
};

export default NoticePage;
