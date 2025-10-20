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
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { NoticeDetail, useNoticeStore } from '@/app/store/useNoticeStore';
import { useParams } from 'next/navigation';
import Loading from '@/components/layout/Loading';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const { getDetail, isLoading } = useNoticeStore();
  const [detail, setDetail] = useState<NoticeDetail | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const data = await getDetail(Number(id));
        setDetail(data);
      } catch (err) {
        console.error('공지 상세 조회 실패', err);
      }
    };

    fetchDetail();
  }, [id]);

  if (isLoading) {
    return <Loading />;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="subWrap">
      <div className="inner">
        <div className="left">
          <SubPageTitle
            title="공지사항"
            firstDepth="새소식"
            titleUri="/news/notice"
          />

          {/* 테이블 */}
          <div className="tblComponent detail">
            <table>
              <colgroup>
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <div className="detailTitleWrap">
                      <div className="title">{detail?.notice_title}</div>
                      <div className="num">번호 {detail?.notice_id}</div>
                      {detail?.update_date === today && (
                        <span className="new"></span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="detailInfo">
                      <span className="name"></span>
                      <div className="info">
                        <span className="date">{detail?.update_date}</span>
                        <span className="view">조회 {detail?.view_count}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="tbl_btm_none">
                    <div className="minheight100">
                      {detail?.notice_contents}
                    </div>
                  </td>
                </tr>
                {/* <tr>
                  <td className="padding0">
                    <div className="replyInfo">
                      <span className="reply">{detail?.comment_count}</span>
                      <span className="favorite">
                        {detail?.recommend_count}
                      </span>
                    </div>
                    <div className="replyWrap">
                      <ul>
                        <li>
                          <div>
                            <div className="userInfo">
                              <strong>닉네임</strong>
                              <span className="time">2025-10-01 09:49:12</span>
                              <div className="btnWrap">
                                <button>답글</button>
                                <button>수정</button>
                                <button>삭제</button>
                              </div>
                            </div>
                            <div className="text">댓글내용</div>
                          </div>
                          <ul>
                            <li>
                              <div>
                                <div className="userInfo">
                                  <strong>닉네임</strong>
                                  <span className="time">
                                    2025-10-01 09:49:12
                                  </span>
                                  <div className="btnWrap">
                                    <button>수정</button>
                                    <button>삭제</button>
                                  </div>
                                </div>
                                <div className="text">댓글내용</div>
                              </div>
                            </li>
                            <li>
                              <div>
                                <div className="userInfo">
                                  <strong>닉네임</strong>
                                  <span className="time">
                                    2025-10-01 09:49:12
                                  </span>
                                  <div className="btnWrap">
                                    <button>수정</button>
                                    <button>삭제</button>
                                  </div>
                                </div>
                                <div className="text">댓글내용</div>
                              </div>
                            </li>
                            <li>
                              <div>
                                <div className="userInfo">
                                  <strong>닉네임</strong>
                                  <span className="time">
                                    2025-10-01 09:49:12
                                  </span>
                                  <div className="btnWrap">
                                    <button>수정</button>
                                    <button>삭제</button>
                                  </div>
                                </div>
                                <div className="text">댓글내용</div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div className="replyWrap">
                      <ul>
                        <li>
                          <div>
                            <div className="userInfo">
                              <strong>닉네임</strong>
                              <span className="time">2025-10-01 09:49:12</span>
                              <div className="btnWrap">
                                <button>답글</button>
                                <button>수정</button>
                                <button>삭제</button>
                              </div>
                            </div>
                            <div className="text">댓글내용</div>
                          </div>
                          <ul>
                            <li>
                              <div>
                                <div className="userInfo">
                                  <strong>닉네임</strong>
                                  <span className="time">
                                    2025-10-01 09:49:12
                                  </span>
                                  <div className="btnWrap">
                                    <button>수정</button>
                                    <button>삭제</button>
                                  </div>
                                </div>
                                <div className="text">댓글내용</div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div className="replyWrite">
                      <textarea
                        name=""
                        id=""
                        placeholder="로그인 하신 후 댓글을 작성하실 수 있습니다."
                      ></textarea>
                      <button>등록</button>
                    </div>
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>

          {/* 테이블 */}
          <div className="tblComponent">
            <table>
              <colgroup>
                <col width="15%" />
                <col width="70%" />
                <col />
              </colgroup>
              <tbody>
                {(['prev', 'next'] as const).map((type) => {
                  const isPrev = type === 'prev';
                  const label = isPrev ? '이전글' : '다음글';

                  // 0번, 1번 중 조건에 맞는 글 찾기
                  const notice = Object.values(
                    detail?.near_notice_list ?? {},
                  ).find((n) => {
                    if (!n) return false;
                    if (isPrev) return n.notice_id < (detail?.notice_id ?? 0);
                    return n.notice_id > (detail?.notice_id ?? 0);
                  });

                  return (
                    <tr key={type}>
                      <td>{label}</td>
                      <td>
                        {notice ? (
                          <Link href={`/news/notice/${notice.notice_id}`}>
                            {notice.notice_title}
                          </Link>
                        ) : (
                          `${label}이 없습니다.`
                        )}
                      </td>
                      <td>{notice?.create_date?.slice(0, 10) ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 버튼그룹 */}
          <div className="btnWrap right">
            <Link href="/news/notice" className="default">
              목록
            </Link>
            <button className="default">수정</button>
            <button className="default">삭제</button>
          </div>
        </div>

        <SubPageLogin />
      </div>
    </div>
  );
};

export default NoticeDetailPage;
