'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Post {
  board_id: number;
  user_uuid: string;
  user_name: string;
  board_type: number;
  board_category: number;
  board_title: string;
  board_contents: string;
  comment_count: number;
  view_count: number;
  recommend_count: number;
  info_delete: boolean;
  info_block: boolean;
  create_date: string;
  update_date: string;
  near_board_list: {
    [key: string]: {
      board_id: number;
      board_type: string;
      board_title: string;
      create_date: string;
    };
  };
}

interface Comment {
  comment_id: number;
  comment_reply_id: number;
  comment_contents: string;
  is_delete: boolean;
  create_date: string;
  user_name: string;
}

interface CommentListResponse {
  total_page: number;
  comment_list: Comment[];
}

const FreePostDetailPage = () => {
  const params = useParams();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [post, setPost] = useState<Post | null>(null);
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

  // 게시글 데이터 로드
  useEffect(() => {
    const fetchPost = async () => {
      // params.id가 유효한 숫자인지 확인
      const postId = Number(params.id);
      if (!postId || isNaN(postId)) {
        console.log('유효하지 않은 게시글 ID:', params.id);
        return;
      }

      // 이미 API 호출 중인지 확인 (중복 호출 방지)
      if (isLoadingRef.current) {
        console.log('이미 API 호출 중:', postId);
        return;
      }

      try {
        isLoadingRef.current = true; // API 호출 시작
        console.log('게시글 데이터 로드 시작:', postId); // 디버깅용 로그
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/board/detail/${postId}`);
        
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }

        const data: Post = await response.json();
        console.log('게시글 데이터 로드 완료:', postId); // 디버깅용 로그
        setPost(data);
      } catch (error) {
        console.error('게시글 로딩 오류:', error);
        // 에러 발생 시 기본 데이터 사용
        setPost(getDefaultPost());
      } finally {
        isLoadingRef.current = false; // API 호출 완료
      }
    };

    // params.id가 존재하고 유효한 경우에만 API 호출
    if (params.id && !isNaN(Number(params.id))) {
      fetchPost();
    }
  }, [params.id]);

  // 댓글 데이터 로드
  useEffect(() => {
    const fetchComments = async () => {
      if (!post) return;

      const boardId = post.board_id;
      setIsLoadingComments(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/comment/list/${boardId}/${commentPage}`
        );

        if (!response.ok) {
          throw new Error('댓글을 불러오는데 실패했습니다.');
        }

        const data: CommentListResponse = await response.json();
        setComments(data.comment_list);
        setTotalCommentPages(data.total_page);
      } catch (error) {
        console.error('댓글 로딩 오류:', error);
        setComments([]);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [post, commentPage]);

  // 기본 샘플 데이터 (API 실패 시 사용)
  const getDefaultPost = (): Post => ({
    board_id: 1,
    user_uuid: 'default-uuid',
    user_name: '게이머1',
    board_type: 0,
    board_category: 0,
    board_title: '오늘 게임하면서 느낀 점',
    board_contents: `안녕하세요! 오늘 게임을 하면서 정말 재미있었습니다. 

특히 새로운 던전이 너무 어려워서 고생했지만 클리어했을 때의 성취감이 대단했어요!

던전 클리어 과정:
1. 파티원들과 함께 던전 입장
2. 중간 보스들과의 전투
3. 최종 보스와의 대결
4. 클리어 후 보상 획득

정말 힘들었지만 파티원들과 함께라서 더욱 즐거웠습니다. 
다음에도 이런 재미있는 던전이 나왔으면 좋겠어요!

여러분도 비슷한 경험이 있으신가요? 공유해주세요!`,
    comment_count: 3,
    view_count: 156,
    recommend_count: 23,
    info_delete: false,
    info_block: false,
    create_date: '2025-01-27T00:00:00.000Z',
    update_date: '2025-01-27T00:00:00.000Z',
    near_board_list: {
      '0': {
        board_id: 2,
        board_type: '0',
        board_title: '새로운 캐릭터 추천해주세요',
        create_date: '2025-01-27T00:00:00.000Z'
      },
      '1': {
        board_id: 3,
        board_type: '0',
        board_title: '길드원 모집합니다!',
        create_date: '2025-01-26T00:00:00.000Z'
      }
    }
  });

  const handleLike = () => {
    if (post) {
      setPost({
        ...post,
        recommend_count: isLiked ? post.recommend_count - 1 : post.recommend_count + 1
      });
      setIsLiked(!isLiked);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    // 로그인 확인 (필요시)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/comment/insert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            board_id: post.board_id,
            comment_reply_id: replyTo || 0,
            comment_contents: newComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`댓글 작성 실패: ${response.status} ${response.statusText}\n${errorText}`);
      }

      // 댓글 작성 성공
      setNewComment('');
      setReplyTo(null);
      
      // 댓글 목록 새로고침
      const commentsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/comment/list/${post.board_id}/${commentPage}`
      );

      if (commentsResponse.ok) {
        const data: CommentListResponse = await commentsResponse.json();
        setComments(data.comment_list);
        setTotalCommentPages(data.total_page);
        
        // 게시글의 댓글 수 업데이트
        setPost({
          ...post,
          comment_count: post.comment_count + 1
        });
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      alert(error instanceof Error ? error.message : '댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = (commentId: number) => {
    setReplyTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  if (!post) {
    return (
      <div className="min-h-screen text-white pt-32">
        <div className="relative z-20 container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-32">
      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            자유게시판
          </h1>
          {currentTime && (
            <p className="text-sm text-gray-400">
              {isDaytime ? '☀️ 낮 모드' : '🌙 밤 모드'} - {currentTime.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </p>
          )}
        </div>

        {/* Post Detail */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden mb-8">
          {/* Post Header */}
          <div className="bg-gray-800/50 border-b border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{post.board_title}</h2>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>작성자: {post.user_name}</span>
                <span>작성일: {new Date(post.create_date).toLocaleDateString('ko-KR')}</span>
                <span>조회수: {post.view_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                    isLiked 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>❤️</span>
                  <span>{post.recommend_count}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                {post.board_contents}
              </div>
            </div>
          </div>
        </div>

        {/* Near Board List */}
        {post.near_board_list && Object.keys(post.near_board_list).length > 0 && (
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden mb-8">
            <div className="bg-gray-800/50 border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white">이전/다음 게시글</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {Object.entries(post.near_board_list).map(([, nearPost]) => (
                  <Link
                    key={nearPost.board_id}
                    href={`/community/free/${nearPost.board_id}`}
                    className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white hover:text-blue-400 transition-colors">
                        {nearPost.board_title}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(nearPost.create_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden mb-8">
          <div className="bg-gray-800/50 border-b border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white">댓글 ({post.comment_count})</h3>
          </div>

          {/* Comments List */}
          <div className="p-4">
            {isLoadingComments ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">댓글을 불러오는 중...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div 
                      key={comment.comment_id} 
                      className={`space-y-3 ${comment.comment_reply_id !== 0 ? 'ml-12' : ''}`}
                    >
                      <div
                        className={`p-4 rounded-lg ${
                          comment.is_delete 
                            ? 'bg-gray-800/30 border border-gray-700' 
                            : 'bg-gray-800'
                        } ${comment.comment_reply_id !== 0 ? 'border-l-4 border-l-purple-600' : ''}`}
                      >
                        {comment.is_delete ? (
                          <p className="text-gray-500 italic">삭제된 댓글입니다.</p>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {comment.comment_reply_id !== 0 && (
                                  <span className="text-purple-400 text-sm">↳</span>
                                )}
                                <span className="font-semibold text-blue-400">
                                  {comment.user_name}
                                </span>
                                {comment.comment_reply_id !== 0 && (
                                  <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                                    답글
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-400">
                                {new Date(comment.create_date).toLocaleString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap mb-3">
                              {comment.comment_contents}
                            </p>
                            {/* 일반 댓글에만 답글 버튼 표시 (대댓글에는 표시하지 않음) */}
                            {comment.comment_reply_id === 0 && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleReply(comment.comment_id)}
                                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                                >
                                  ↳ 답글
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* 답글 작성 폼 - 해당 댓글 아래에 표시 */}
                      {replyTo === comment.comment_id && (
                        <div className="ml-8 p-4 bg-gray-900/50 rounded-lg border border-purple-700/30">
                          <form onSubmit={handleCommentSubmit} className="space-y-4">
                            {/* 답글 표시 */}
                            <div className="flex items-center justify-between bg-purple-900/30 border border-purple-700 rounded-lg px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-purple-400">↳ {comment.user_name}님에게 답글 작성 중</span>
                              </div>
                              <button
                                type="button"
                                onClick={handleCancelReply}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                            
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder={`${comment.user_name}님에게 답글을 입력하세요...`}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-left"
                              style={{ direction: 'ltr', textAlign: 'left' }}
                              rows={3}
                              disabled={isSubmittingComment}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleCancelReply}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                disabled={isSubmittingComment}
                              >
                                취소
                              </button>
                              <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmittingComment || !newComment.trim()}
                              >
                                {isSubmittingComment ? '작성 중...' : '답글 작성'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Comment Pagination */}
                {totalCommentPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCommentPage(Math.max(1, commentPage - 1))}
                      disabled={commentPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      이전
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalCommentPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCommentPage(page)}
                          className={`px-4 py-2 rounded transition-colors ${
                            page === commentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCommentPage(Math.min(totalCommentPages, commentPage + 1))}
                      disabled={commentPage === totalCommentPages}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Comment Form - 댓글 목록 아래 댓글 작성 폼 (답글이 아닐 때만 표시) */}
          {replyTo === null && (
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-left"
                  rows={3}
                  disabled={isSubmittingComment}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmittingComment || !newComment.trim()}
                  >
                    {isSubmittingComment ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Link
            href="/community/free"
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로
          </Link>

          <div className="flex gap-2">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              수정
            </button>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreePostDetailPage;
