'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface GalleryPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: Comment[];
  imageUrl: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
}

const GalleryPostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [post, setPost] = useState<GalleryPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // 샘플 데이터
  const samplePost: GalleryPost = {
    id: 1,
    title: '내 캐릭터 스크린샷',
    content: `오늘 던전 클리어 후 찍은 스크린샷입니다. 정말 멋진 장면이었어요!

던전 클리어 순간의 짜릿함을 담았습니다. 파티원들과 함께라서 더욱 특별했던 순간이었어요.

스크린샷을 찍은 이유:
- 보스 클리어 순간의 성취감을 기록
- 파티원들과의 추억을 남기기 위해
- 게임 내 아름다운 장면을 공유하고 싶어서

여러분도 비슷한 스크린샷이 있으시다면 공유해주세요!`,
    author: '스크린샷러',
    date: '2025-01-27',
    views: 234,
    likes: 45,
    imageUrl: '/api/placeholder/800/600',
    comments: [
      {
        id: 1,
        author: '갤러리러',
        content: '정말 멋진 스크린샷이네요! 어떤 던전인가요?',
        date: '2025-01-27',
        likes: 3
      },
      {
        id: 2,
        author: '사진작가',
        content: '구도가 정말 좋네요. 스크린샷 찍는 실력이 대단해요!',
        date: '2025-01-27',
        likes: 7
      }
    ]
  };

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
    // 실제로는 API 호출
    setPost(samplePost);
  }, [params.id]);

  const handleLike = () => {
    if (post) {
      setPost({
        ...post,
        likes: isLiked ? post.likes - 1 : post.likes + 1
      });
      setIsLiked(!isLiked);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    const newCommentObj: Comment = {
      id: post.comments.length + 1,
      author: '현재사용자',
      content: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    setPost({
      ...post,
      comments: [...post.comments, newCommentObj]
    });
    setNewComment('');
  };

  if (!post) {
    return (
      <div className="min-h-screen text-white pt-32">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-32">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            유저갤러리
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
            <h2 className="text-2xl font-bold text-white mb-4">{post.title}</h2>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>작성자: {post.author}</span>
                <span>작성일: {post.date}</span>
                <span>조회수: {post.views.toLocaleString()}</span>
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
                  <span>{post.likes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="p-6">
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="w-full h-96 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                {post.content}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden mb-8">
          <div className="bg-gray-800/50 border-b border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white">댓글 ({post.comments.length})</h3>
          </div>

          {/* Comment Form */}
          <div className="p-4 border-b border-gray-700">
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  댓글 작성
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="divide-y divide-gray-700">
            {post.comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{comment.author}</span>
                    <span className="text-sm text-gray-400">{comment.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>❤️ {comment.likes}</span>
                  </div>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Link
            href="/community/gallery"
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로
          </Link>

          <div className="flex gap-2">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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

export default GalleryPostDetailPage;
