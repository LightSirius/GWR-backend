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

const NoticeDetailPage = () => {
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
                      <div className="title">지인과의 관계 트러블</div>
                      <div className="num">번호 561</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="detailInfo">
                      <span className="name">작성자닉네임</span>
                      <div className="info">
                        <span className="date">2025-10-01</span>
                        <span className="view">1136</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="tbl_btm_none">
                    <div className="minheight100">{/* 내용 */}</div>
                  </td>
                </tr>
                <tr>
                  <td className="padding0">
                    <div className="replyInfo">
                      <span className="reply">2</span>
                      <span className="favorite">4</span>
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
                </tr>
              </tbody>
            </table>
          </div>

          {/* 테이블 */}
          <div className="tblComponent">
            <table>
              <colgroup>
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td>이전글</td>
                  <td>
                    <Link href="">
                      10.03(금) ~ 10.09(목) 추석 연휴 기간 고객센터 휴무 안내
                    </Link>
                  </td>
                  <td>2025-10-01</td>
                  <td>1136</td>
                </tr>
                <tr>
                  <td>다음글</td>
                  <td>
                    <Link href="">
                      10.03(금) ~ 10.09(목) 추석 연휴 기간 고객센터 휴무 안내
                    </Link>
                  </td>
                  <td>2025-10-01</td>
                  <td>1136</td>
                </tr>
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
            <button className="primary">글쓰기</button>
          </div>
        </div>

        <SubPageLogin />
      </div>
    </div>
  );
};

export default NoticeDetailPage;
