'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageTitle from '@/components/layout/SubPageTitle';
import SubPageLogin from '@/components/layout/SubPageLogin';
import { useNoticeStore } from '@/app/store/useNoticeStore';
import { useRouter, useParams } from 'next/navigation';
import Loading from '@/components/layout/Loading';
import { useQuery } from '@tanstack/react-query';
import TiptabContent from '@/components/layout/TiptabContent';
import DeletePop from '@/components/layout/popup/DeletePop';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { getDetail, setSelectedNotice, noticeDelete } = useNoticeStore();
  const [isOpen, setIsOpen] = useState(false); // 삭제 팝업

  const {
    data: detail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['noticeDetail', id],
    queryFn: () => getDetail(Number(id)),
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
  });

  useEffect(() => {
    if (detail) {
      console.log('공지 상세 불러오기 성공:', detail);
      setSelectedNotice({
        notice_type: Number(detail?.notice_type) ?? 0,
        notice_title: detail?.notice_title ?? '',
        notice_contents: detail?.notice_contents ?? '',
        notice_fix: false, // 데이터 없음
        info_delete: false,
      }); // 선택한 공지를 store에 저장
    }
    if (error) {
      console.log('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [detail, error]);

  if (isLoading) {
    return <Loading />;
  }

  const today = new Date().toISOString().split('T')[0];
  const formattedDate = detail?.update_date
    ? new Date(detail.update_date).toISOString().split('T')[0]
    : '';

  // 게시글 삭제
  const handleDelete = async () => {
    const deleteData = {
      notice_id: Number(id),
    };
    console.log('게시글아이디', id);

    try {
      let result: any;
      result = await noticeDelete(deleteData);

      // status가 0(success)이거나 'success'일 때 성공으로 처리
      if (result.status === 0 || result.status === 'success') {
        alert('게시글 삭제에 성공했습니다.');
        // 성공 시 해당 게시글로 이동
        router.push(`/news/notice`);
      } else {
        // 실패 시 구체적인 에러 메시지 표시
        let errorMessage = '게시글 삭제에 실패했습니다.';

        if (result.status === 1) {
          errorMessage = 'CUID가 설정되지 않았습니다.';
        } else if (result.status === 2) {
          errorMessage = '게시글 삭제에 실패했습니다.';
        } else if (result.status === 3) {
          errorMessage = '시스템 오류가 발생했습니다.';
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error('삭제처리 중 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : '삭제처리 중 오류가 발생했습니다.',
      );
    }

    // 실제 삭제 로직
    console.log('삭제 실행!');
    setIsOpen(false);
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
                        <span className="date">
                          {detail
                            ? new Date(detail.update_date)
                                .toISOString()
                                .split('T')[0]
                            : ''}
                        </span>
                        <span className="view">{detail?.view_count}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="tbl_btm_none">
                    <div className="minheight100">
                      {detail?.notice_contents && (
                        <TiptabContent content={detail.notice_contents} />
                      )}
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
            <Link
              className="default"
              href={`/news/notice/write?id=${detail?.notice_id}`}
            >
              수정
            </Link>
            <button
              className="default"
              onClick={() => {
                setIsOpen(true);
                console.log('확인');
              }}
            >
              삭제
            </button>
            <DeletePop
              isOpen={isOpen}
              title={'삭제 확인'}
              description={'이 게시물을 정말 삭제하시겠습니까?'}
              onClose={() => setIsOpen(false)}
              onConfirm={handleDelete}
            />
          </div>
        </div>
        <SubPageLogin />
      </div>
    </div>
  );
};

export default NoticeDetailPage;
