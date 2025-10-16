'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageTitle from '@/components/layout/SubPageTitle';
import SubPageLogin from '@/components/layout/SubPageLogin';
import {
  Button,
  ButtonGroup,
  IconButton,
  Pagination,
  SegmentGroup,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface Update {
  id: number;
  type: '공지' | '점검' | '이벤트' | '패치';
  title: string;
  content: string;
  date: string;
  author: string;
  views: number;
  isImportant?: boolean;
}

const UpdatePage = () => {
  const items = [
    {
      id: 1,
      kind: '점검',
      title: '10.03(금) ~ 10.09(목) 추석 연휴 기간 고객센터 휴무 안내',
      views: 100,
      date: '2025-10-16',
      comments: 3,
    },
    {
      id: 2,
      kind: '공지사항',
      title: '10.03(금) ~ 10.09(목) 추석 연휴 기간 고객센터 휴무 안내',
      views: 150,
      date: '2024-01-02',
      comments: 0,
    },
    {
      id: 3,
      kind: '점검',
      title: '10.03(금) ~ 10.09(목) 추석 연휴 기간 고객센터 휴무 안내',
      views: 200,
      date: '2024-01-03',
      comments: 1,
    },
    {
      id: 4,
      kind: '이벤트',
      title: '10.03(금) ~ 10.09(목) 추석 연휴 기간 고객센터 휴무 안내',
      views: 250,
      date: '2024-01-04',
      comments: 5,
    },
    {
      id: 5,
      kind: '패치',
      title: '10.03(금) ~ 10.09(목) 추석 연휴 기간 고객센터 휴무 안내',
      views: 300,
      date: '2024-01-05',
      comments: 2,
    },
    {
      id: 6,
      kind: '공지사항',
      title: '서버 점검 안내 - 2024.01.06',
      views: 350,
      date: '2024-01-06',
      comments: 0,
    },
    {
      id: 7,
      kind: '점검',
      title: '점검 일정 변경 안내 - 2024.01-07',
      views: 400,
      date: '2024-01-07',
      comments: 4,
    },
    {
      id: 8,
      kind: '이벤트',
      title: '신규 이벤트 안내 - 2024.01.08',
      views: 450,
      date: '2024-01-08',
      comments: 6,
    },
    {
      id: 9,
      kind: '패치',
      title: '게임 패치 노트 - 2024.01.09',
      views: 500,
      date: '2024-01-09',
      comments: 1,
    },
    {
      id: 10,
      kind: '공지사항',
      title: '추가 공지사항 - 2024.01.10',
      views: 550,
      date: '2024-01-10',
      comments: 0,
    },
  ];

  return (
    <div className="subWrap">
      <div className="inner">
        <div className="left">
          <SubPageTitle
            firstDepth="새소식"
            title="업데이트"
            titleUri="/news/update"
          />

          {/* 테이블 */}
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
                {items.map((item) => {
                  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
                  return (
                    <tr key={item.id}>
                      <td className="agnC">{item.id}</td>
                      <td className="agnC">{item.kind}</td>
                      <td>
                        <Link
                          href={`/news/notice/${item.id}`}
                          className="title"
                        >
                          {item.title}
                          {/* 오늘 올라온 글이면 NEW 표시 */}
                          {item.date === today && <span className="new"></span>}

                          {/* 댓글이 있으면 댓글 수 표시 */}
                          {item.comments > 0 && (
                            <span className="reply">{item.comments}</span>
                          )}
                        </Link>
                      </td>
                      <td className="agnC">{item.views}</td>
                      <td className="agnC">{item.date}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={5}>
                    {/* 노데이터 */}
                    <div className="noData">등록된 게시물이 없습니다.</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 버튼그룹 */}
          <div className="btnWrap right">
            <button className="primary">글쓰기</button>
          </div>

          {/* 페이지네이션 */}
          <Pagination.Root
            count={20}
            pageSize={2}
            defaultPage={1}
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
                  <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
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

          {/* 검색 */}
          <div className="searchArea">
            <select name="" id="">
              <option value="">최신순</option>
              <option value="">정확도순</option>
            </select>
            <select name="" id="">
              <option value="">제목</option>
              <option value="">내용</option>
            </select>
            <input type="text" />
            <button>검색</button>
          </div>
        </div>

        <SubPageLogin />
      </div>
    </div>
  );
};

export default UpdatePage;
