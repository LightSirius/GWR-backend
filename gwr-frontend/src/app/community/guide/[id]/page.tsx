'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface GuidePost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: Comment[];
  category: '초보자' | '중급자' | '고급자' | '던전' | 'PvP' | '직업';
  difficulty: 1 | 2 | 3 | 4 | 5;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
}

const GuidePostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [post, setPost] = useState<GuidePost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // 샘플 데이터
  const samplePost: GuidePost = {
    id: 1,
    title: '초보자를 위한 게임 시작 가이드',
    content: `안녕하세요! 게임을 처음 시작하는 분들을 위한 상세한 가이드입니다.

## 🎮 기본 조작법
- WASD: 캐릭터 이동
- 마우스: 시점 조작
- 스페이스바: 점프
- E: 상호작용
- I: 인벤토리

## 📈 레벨업 팁
1. **퀘스트 우선**: 메인 퀘스트를 먼저 진행하세요
2. **사이드 퀘스트**: 경험치와 아이템을 얻을 수 있어요
3. **던전 도전**: 파티를 구성해서 던전에 도전해보세요
4. **일일 퀘스트**: 매일 새로운 퀘스트가 갱신됩니다

## ⚔️ 직업 선택 가이드
- **전사**: 높은 체력과 방어력, 초보자에게 추천
- **마법사**: 강력한 마법 공격, 조작이 어려울 수 있음
- **궁수**: 원거리 공격, 안전한 플레이 가능
- **힐러**: 파티에서 필수적인 역할

## 💡 초보자 팁
- 처음에는 전사로 시작하는 것을 추천합니다
- 퀘스트를 꼼꼼히 읽어보세요
- 다른 플레이어들과 소통해보세요
- 길드에 가입하면 도움을 받을 수 있어요

더 궁금한 점이 있으시면 댓글로 질문해주세요!`,
    author: '가이드마스터',
    date: '2025-01-27',
    views: 1234,
    likes: 156,
    category: '초보자',
    difficulty: 1,
    comments: [
      {
        id: 1,
        author: '초보자',
        content: '정말 도움이 되었어요! 감사합니다.',
        date: '2025-01-27',
        likes: 12
      },
      {
        id: 2,
        author: '고수님',
        content: '좋은 가이드네요. 추가로 궁금한 점이 있으면 언제든 물어보세요!',
        date: '2025-01-27',
        likes: 8
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '초보자': return 'bg-green-600';
      case '중급자': return 'bg-blue-600';
      case '고급자': return 'bg-purple-600';
      case '던전': return 'bg-red-600';
      case 'PvP': return 'bg-yellow-600';
      case '직업': return 'bg-indigo-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  if (!post) {
    return (
      <div className="min-h-screen text-white pt-32">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            공략게시판
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
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>작성자: {post.author}</span>
                  <span>작성일: {post.date}</span>
                  <span>조회수: {post.views.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
                <div className="text-yellow-400 text-sm">
                  {getDifficultyStars(post.difficulty)}
                </div>
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

          {/* Post Content */}
          <div className="p-6">
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
            href="/community/guide"
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로
          </Link>

          <div className="flex gap-2">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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

export default GuidePostDetailPage;
