'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useBoardStore } from '@/app/store/useBoardStore';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/layout/Loading';
import SubPageTitle from '@/components/layout/SubPageTitle';
import TiptabContent from '@/components/layout/TiptabContent';
import SubPageLogin from '@/components/layout/SubPageLogin';
import DeletePop from '@/components/layout/popup/DeletePop';
import { useAuth } from '@/contexts/AuthContext';

const FreePostDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // 삭제 팝업
  // Auth
  const { isAuthenticated, accessToken } = useAuth();
  // Zustand Store
  const {
    isLoading,
    getDetail,
    selectedBoard,
    setSelectedBoard,
    getCommentList,
    commentPaging,
    setCommentPaging,
    boardDelete,
    insertComment,
    updateComment,
  } = useBoardStore();

  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const isLoadingRef = useRef(false); // API 호출 중복 방지용 ref

  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [totalCommentPages, setTotalCommentPages] = useState(1);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null); // 답글 대상 comment_id

  const [replyOpenId, setReplyOpenId] = useState<number | null>(null); // 어떤 댓글에 답글창 열릴지
  const [editOpenId, setEditOpenId] = useState<number | null>(null); // 어떤 댓글을 수정중인지
  const [editContent, setEditContent] = useState<string>(''); // 수정 내용
  const [replyContent, setReplyContent] = useState<string>(''); // 답글 내용
  const [reply, setReply] = useState<string>(''); // 새 코멘트 내용
  const [commentState, setCommentState] = useState({
    mode: null as 'reply' | 'edit' | null, // 현재 모드 (답글 / 수정 / 기본)
    commentId: null as number | null, // 코멘트 id
    targetId: null as number | null, // 대상 comment_id
    targetBoardId: null as number | null, // 대상 게시글 id
    content: '', // textarea 내용
  });

  // 게시글 데이터 로드
  const {
    data: detail,
    isLoading: idBoardLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['boardDetail', id],
    queryFn: () => getDetail(Number(id)),
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
  });

  useEffect(() => {
    if (detail) {
      setSelectedBoard(detail); // 선택한 게시글을 store에 저장
      console.log('detail', detail);
    }
    if (error) {
      console.log('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [detail, error]);

  // 게시글 코멘트 데이터 로드
  const {
    data: conmmentList,
    isLoading: idCommentLoading,
    isError: isCommentError,
    error: commemtError,
  } = useQuery({
    queryKey: ['conmmentList', detail?.board_id, commentPaging.curPage],
    queryFn: () =>
      getCommentList(Number(detail?.board_id), commentPaging.curPage),
    enabled: !!detail?.board_id, // id가 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
  });

  useEffect(() => {
    if (conmmentList) {
      console.log('conmmentList', conmmentList);
    }
    if (error) {
      console.log('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [conmmentList, commentPaging.curPage]);

  if (isLoading) {
    return <Loading />;
  }

  // const handleLike = () => {
  //   if (post) {
  //     setPost({
  //       ...post,
  //       recommend_count: isLiked
  //         ? post.recommend_count - 1
  //         : post.recommend_count + 1,
  //     });
  //     setIsLiked(!isLiked);
  //   }
  // };

  // const handleCommentSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newComment.trim() || !post) return;

  //   // 로그인 확인 (필요시)
  //   const token = localStorage.getItem('accessToken');
  //   if (!token) {
  //     alert('로그인이 필요합니다.');
  //     return;
  //   }

  //   setIsSubmittingComment(true);

  const handleCommentSubmit = async () => {
    console.log('데이터', commentState);

    try {
      let result: any;

      if (commentState.mode === 'edit') {
        // 수정
        result = await updateComment(
          Number(commentState.targetBoardId),
          commentState.content,
          commentState,
        );
      } else if (commentState.mode === 'reply') {
        // 답글
        result = await insertComment(
          Number(commentState.targetBoardId),
          commentState.content,
          commentState,
        );
      } else {
        // 등록
        result = await insertComment(
          Number(commentState.targetBoardId),
          commentState.content,
          commentState,
        );
      }

      // // status가 0(success)이거나 'success'일 때 성공으로 처리
      // if (result.status === 0 || result.status === 'success') {
      //   let message = boardId
      //     ? '게시글 수정에 성공했습니다.'
      //     : '게시글 등록에 성공했습니다.';

      //   alert(message);
      //   // 성공 시 해당 게시글로 이동
      //   router.push(`/news/notice/${result.notice_id}`);
      // } else {
      //   // 실패 시 구체적인 에러 메시지 표시
      //   let errorMessage = boardId ? '게시글 수정 실패' : '게시글 등록 실패';

      //   if (result.status === 1) {
      //     errorMessage = 'CUID가 설정되지 않았습니다.';
      //   } else if (result.status === 2) {
      //     errorMessage = boardId
      //       ? '게시글 수정에 실패했습니다.'
      //       : '게시글 등록에 실패했습니다.';
      //   } else if (result.status === 3) {
      //     errorMessage = '시스템 오류가 발생했습니다.';
      //   }

      //   alert(errorMessage);
      // }
    } catch (error) {
      console.error('게시글 처리 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : '게시글 처리 중 오류가 발생했습니다.',
      );
    }
  };

  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/comment/insert`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           board_id: post.board_id,
  //           comment_reply_id: replyTo || 0,
  //           comment_contents: newComment.trim(),
  //         }),
  //       },
  //     );

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(
  //         `댓글 작성 실패: ${response.status} ${response.statusText}\n${errorText}`,
  //       );
  //     }

  //     // 댓글 작성 성공
  //     setNewComment('');
  //     setReplyTo(null);

  //     // 댓글 목록 새로고침
  //     const commentsResponse = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/comment/list/${post.board_id}/${commentPage}`,
  //     );

  //     if (commentsResponse.ok) {
  //       const data: CommentListResponse = await commentsResponse.json();
  //       setComments(data.comment_list);
  //       setTotalCommentPages(data.total_page);

  //       // 게시글의 댓글 수 업데이트
  //       setPost({
  //         ...post,
  //         comment_count: post.comment_count + 1,
  //       });
  //     }
  //   } catch (error) {
  //     console.error('댓글 작성 오류:', error);
  //     alert(
  //       error instanceof Error ? error.message : '댓글 작성에 실패했습니다.',
  //     );
  //   } finally {
  //     setIsSubmittingComment(false);
  //   }
  // };

  // const handleReply = (commentId: number) => {
  //   setReplyTo(commentId);
  // };

  // const handleCancelReply = () => {
  //   setReplyTo(null);
  // };

  // if (!post) {
  //   return (
  //     <div className="min-h-screen text-white pt-32">
  //       <div className="relative z-20 container mx-auto px-4 py-8 text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
  //         <p className="mt-4 text-gray-400">게시글을 불러오는 중...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // 게시글 삭제
  const handleDelete = async () => {
    const deleteData = {
      board_id: Number(id),
    };

    try {
      let result: any;
      result = await boardDelete(deleteData);

      // status가 0(success)이거나 'success'일 때 성공으로 처리
      if (result.status === 0 || result.status === 'success') {
        alert('게시글 삭제에 성공했습니다.');
        // 성공 시 해당 게시글로 이동
        router.push(`/community/free`);
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
    setIsOpen(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const formattedDate = detail?.update_date
    ? new Date(detail.update_date).toISOString().split('T')[0]
    : '';
  const formattedDateTime = (dateString: string) => {
    const d = new Date(dateString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
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
                      <div className="title">{detail?.board_title}</div>
                      <div className="num">번호 {detail?.board_id}</div>
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
                      <span className="name">{detail?.user_name}</span>
                      <div className="info">
                        <span className="date">{formattedDate}</span>
                        <span className="view">{detail?.view_count}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="tbl_btm_none">
                    <div className="minheight100">
                      {detail?.board_contents && (
                        <TiptabContent content={detail.board_contents} />
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="padding0">
                    <div className="replyInfo">
                      <span className="reply">{detail?.comment_count}</span>
                      <span className="favorite">
                        {detail?.recommend_count}
                      </span>
                    </div>
                    {/* 댓글 리스트 */}
                    <div className="replyWrap">
                      <ul>
                        {conmmentList?.comment_list
                          .filter((c: any) => c.comment_reply_id === 0)
                          .map((comment: any) => (
                            <li key={comment.comment_id}>
                              <div>
                                <div className="userInfo">
                                  <strong>{comment.user_name}</strong>
                                  <span className="time">
                                    {formattedDateTime(comment.create_date)}
                                  </span>

                                  {isAuthenticated && (
                                    <div className="btnWrap">
                                      <button
                                        onClick={() =>
                                          setCommentState((prev) => ({
                                            mode:
                                              prev.mode === 'reply' &&
                                              prev.targetId ===
                                                comment.comment_id
                                                ? null
                                                : 'reply',
                                            commentId: 1,
                                            targetId: comment.comment_id,
                                            targetBoardId: Number(id),
                                            content: '',
                                          }))
                                        }
                                      >
                                        답글
                                      </button>
                                      <button
                                        onClick={() =>
                                          setCommentState((prev) => ({
                                            mode:
                                              prev.mode === 'edit' &&
                                              prev.targetId ===
                                                comment.comment_id
                                                ? null
                                                : 'edit',
                                            commentId: 1,
                                            targetId: comment.comment_id,
                                            targetBoardId: Number(id),
                                            content: comment.comment_contents,
                                          }))
                                        }
                                      >
                                        수정
                                      </button>
                                      <button>삭제</button>
                                    </div>
                                  )}
                                </div>

                                {/* 수정 textarea */}
                                {commentState.mode === 'edit' &&
                                commentState.targetId === comment.comment_id ? (
                                  <div className="replyWrite">
                                    <textarea
                                      value={commentState.content}
                                      onChange={(e) =>
                                        setCommentState((prev) => ({
                                          ...prev,
                                          content: e.target.value,
                                        }))
                                      }
                                    />
                                    <button>수정완료</button>
                                  </div>
                                ) : (
                                  <div className="text">
                                    {comment.comment_contents}
                                  </div>
                                )}

                                {/* 답글 textarea */}
                                {commentState.mode === 'reply' &&
                                  commentState.targetId ===
                                    comment.comment_id && (
                                    <div className="replyWrite">
                                      <textarea
                                        value={commentState.content}
                                        onChange={(e) =>
                                          setCommentState((prev) => ({
                                            ...prev,
                                            content: e.target.value,
                                          }))
                                        }
                                        placeholder="답글 작성"
                                      />
                                      <button onClick={handleCommentSubmit}>
                                        등록
                                      </button>
                                    </div>
                                  )}
                              </div>

                              {/* 대댓글 렌더링 */}
                              <ul className="rereply">
                                {conmmentList?.comment_list
                                  .filter(
                                    (reply: any) =>
                                      reply.comment_reply_id ===
                                      comment.comment_id,
                                  )
                                  .map((reply: any) => (
                                    <li key={reply.comment_id}>
                                      <div>
                                        <div className="userInfo">
                                          <strong>{reply.user_name}</strong>
                                          <span className="time">
                                            {formattedDateTime(
                                              reply.create_date,
                                            )}
                                          </span>

                                          {isAuthenticated && (
                                            <div className="btnWrap">
                                              <button
                                                onClick={() =>
                                                  setCommentState((prev) => ({
                                                    mode:
                                                      prev.mode === 'edit' &&
                                                      prev.targetId ===
                                                        reply.comment_id
                                                        ? null
                                                        : 'edit',
                                                    commentId: 1,
                                                    targetId: reply.comment_id,
                                                    targetBoardId: Number(id),
                                                    content:
                                                      reply.comment_contents,
                                                  }))
                                                }
                                              >
                                                수정
                                              </button>
                                              <button>삭제</button>
                                            </div>
                                          )}
                                        </div>

                                        {commentState.mode === 'edit' &&
                                        commentState.targetId ===
                                          reply.comment_id ? (
                                          <div className="replyWrite">
                                            <textarea
                                              value={commentState.content}
                                              onChange={(e) =>
                                                setCommentState((prev) => ({
                                                  ...prev,
                                                  content: e.target.value,
                                                }))
                                              }
                                            />
                                            <button
                                              onClick={handleCommentSubmit}
                                            >
                                              수정완료
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="text">
                                            {reply.comment_contents}
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                              </ul>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* 최하단 새 댓글 작성 */}
                    <div className="replyWrite">
                      <textarea
                        name="reply"
                        id="reply"
                        placeholder="로그인 하신 후 댓글을 작성하실 수 있습니다."
                        disabled={!isAuthenticated}
                        value={
                          commentState.mode === null && commentState.content
                            ? commentState.content
                            : ''
                        }
                        onChange={(e) => {
                          // TODO::로그인한 유저id랑 내용 insert하기
                          setCommentState((prev) => ({
                            ...prev,
                            mode: null,
                            targetCommentId: null,
                            targetBoardId: Number(id),
                            content: e.target.value,
                          }));
                        }}
                      ></textarea>
                      <button
                        disabled={!isAuthenticated}
                        onClick={handleCommentSubmit}
                      >
                        등록
                      </button>
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
                <col width="15%" />
                <col width="70%" />
                <col />
              </colgroup>
              <tbody>
                {(['prev', 'next'] as const).map((type) => {
                  const isPrev = type === 'prev';
                  const label = isPrev ? '이전글' : '다음글';

                  // 0번, 1번 중 조건에 맞는 글 찾기
                  const board = Object.values(
                    detail?.near_board_list ?? {},
                  ).find((n) => {
                    if (!n) return false;
                    if (isPrev) return n.board_id < (detail?.board_id ?? 0);
                    return n.board_id > (detail?.board_id ?? 0);
                  });

                  return (
                    <tr key={type}>
                      <td>{label}</td>
                      <td>
                        {board ? (
                          <Link href={`/news/notice/${board.board_id}`}>
                            {board.board_title}
                          </Link>
                        ) : (
                          `${label}이 없습니다.`
                        )}
                      </td>
                      <td>{board?.create_date?.slice(0, 10) ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 버튼그룹 */}
          <div className="btnWrap right">
            <Link href="/community/free" className="default">
              목록
            </Link>
            <Link
              className="default"
              href={`/community/free/write?id=${detail?.board_id}`}
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

export default FreePostDetailPage;
