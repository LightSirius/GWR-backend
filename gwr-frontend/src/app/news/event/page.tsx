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

const EventPage = () => {
  const [tab, setTab] = useState('ongoing');

  const posts = [
    {
      id: 1,
      title: '신규 할로윈 이벤트 안내',
      name: '운영팀',
      startDate: '2025-10-16',
      endDate: '2025-10-31',
      view: 120,
      favorite: true,
      href: '#',
    },
    {
      id: 2,
      title: '가을맞이 출석 이벤트 시작!',
      name: '운영팀',
      startDate: '2025-10-10',
      endDate: '2025-10-20',
      view: 95,
      favorite: false,
      href: '#',
    },
    {
      id: 3,
      title: '주말 특별 보상 이벤트',
      name: '운영팀',
      startDate: '2025-10-18',
      endDate: '2025-10-19',
      view: 150,
      favorite: true,
      href: '#',
    },
    {
      id: 4,
      title: '할로윈 코스튬 공모전',
      name: '운영팀',
      startDate: '2025-10-15',
      endDate: '2025-10-31',
      view: 80,
      favorite: false,
      href: '#',
    },
    {
      id: 5,
      title: '이달의 이벤트 퀘스트 안내',
      name: '운영팀',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      view: 200,
      favorite: true,
      href: '#',
    },
    {
      id: 6,
      title: '한정판 아이템 지급 이벤트',
      name: '운영팀',
      startDate: '2025-10-14',
      endDate: '2025-10-20',
      view: 50,
      favorite: false,
      href: '#',
    },
    {
      id: 7,
      title: '친구 초대 이벤트',
      name: '운영팀',
      startDate: '2025-10-12',
      endDate: '2025-10-25',
      view: 130,
      favorite: true,
      href: '#',
    },
    {
      id: 8,
      title: '가을맞이 강화 이벤트',
      name: '운영팀',
      startDate: '2025-10-08',
      endDate: '2025-10-18',
      view: 60,
      favorite: false,
      href: '#',
    },
    {
      id: 9,
      title: '한정판 스킨 이벤트',
      name: '운영팀',
      startDate: '2025-10-05',
      endDate: '2025-10-20',
      view: 170,
      favorite: true,
      href: '#',
    },
  ];

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

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filteredPosts = posts.filter((post) => {
    const isOngoing = today >= post.startDate && today <= post.endDate;
    if (tab === 'ongoing') return isOngoing;
    if (tab === 'ended') return !isOngoing;
    return true; // 당첨자발표일 때는 사용 안 함
  });

  return (
    <div className="subWrap">
      <div className="inner">
        <div className="left">
          <SubPageTitle
            firstDepth="새소식"
            title="이벤트"
            titleUri="/news/event"
          />

          <SegmentGroup.Root
            defaultValue="진행중인 이벤트"
            className="tabWrap"
            value={tab}
            onValueChange={(e) => {
              console.log(e.value, '확인');
              setTab(e.value || '');
            }}
          >
            <SegmentGroup.Indicator />
            <SegmentGroup.Items
              items={[
                { value: 'ongoing', label: '진행중인 이벤트' },
                { value: 'ended', label: '종료된 이벤트' },
                { value: 'winner', label: '당첨자발표' },
              ]}
            />
          </SegmentGroup.Root>

          {(tab === 'ongoing' || tab === 'ended') && (
            <>
              <div className="galleryComponent">
                <ul>
                  {filteredPosts.map((post) => {
                    const isOngoing =
                      today >= post.startDate && today <= post.endDate;
                    return (
                      <li key={post.id} className="itemWrapper">
                        <Link href={post.href} className="item">
                          <span className="img">
                            <img src="/images/imgs/img_guide_01.png" alt="" />
                            <span className={`favorite on`}>4</span>
                          </span>
                          <span className="titleWrap">
                            <strong className="title">{post.title}</strong>
                            <span className="name">{post.name}</span>
                            <span className="info">
                              <span className="date">
                                {post.startDate} ~ {post.endDate}
                              </span>
                              <span className="view">{post.view}</span>
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

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
                      <IconButton
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
            </>
          )}

          {/* 테이블 */}
          {tab === 'winner' && (
            <>
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
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id}>
                          <td className="agnC">{item.id}</td>
                          <td className="agnC">{item.kind}</td>
                          <td>
                            <Link
                              href={`/news/notice/${item.id}`}
                              className="title"
                            >
                              {item.title}
                              {item.date === today && (
                                <span className="new"></span>
                              )}
                              {item.comments > 0 && (
                                <span className="reply">{item.comments}</span>
                              )}
                            </Link>
                          </td>
                          <td className="agnC">{item.views}</td>
                          <td className="agnC">{item.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          <div className="noData">
                            등록된 게시물이 없습니다.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

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
                      <IconButton
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
            </>
          )}
        </div>
        <SubPageLogin />
      </div>
    </div>
  );
};

export default EventPage;
