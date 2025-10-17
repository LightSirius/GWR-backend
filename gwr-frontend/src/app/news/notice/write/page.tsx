'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/layout/Loading';
import SubPageLogin from '@/components/layout/SubPageLogin';
import SubPageTitle from '@/components/layout/SubPageTitle';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

interface WritePostData {
  board_title: string;
  board_contents: string;
  board_contents_es: string;
}

const NoticeWritePage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WritePostData>({
    board_title: '',
    board_contents: '',
    board_contents_es: '',
  });
  const editorRef = useRef<any>(null);
  const handleSave = () => {
    const html = editorRef.current?.getHTML();
    const text = editorRef.current?.getText();

    console.log('HTML 내용:', html);
    console.log('텍스트 내용:', text);
  };

  // HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
  const stripHtmlTags = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/&nbsp;/g, ' ') // &nbsp;를 공백으로 변환
      .replace(/&amp;/g, '&') // &amp;를 &로 변환
      .replace(/&lt;/g, '<') // &lt;를 <로 변환
      .replace(/&gt;/g, '>') // &gt;를 >로 변환
      .replace(/&quot;/g, '"') // &quot;를 "로 변환
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .trim(); // 앞뒤 공백 제거
  };

  // 로그인 상태 확인 및 접근 제어
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중이거나 로그인하지 않은 경우 로딩 화면 표시
  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // board_contents와 board_contents_es를 동기화
    if (name === 'board_contents') {
      setFormData((prev) => ({
        ...prev,
        board_contents: value,
        board_contents_es: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.board_title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.board_contents.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (!accessToken) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/board/insert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`, // JWT 토큰 필요
          },
          body: JSON.stringify({
            board_type: 0, // 자유게시판
            board_category: 0,
            board_title: formData.board_title.trim(),
            board_contents: formData.board_contents.trim(),
            board_contents_es: stripHtmlTags(formData.board_contents), // HTML 태그 제거된 순수 텍스트
          }),
        },
      );

      if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `게시글 작성 실패: ${response.status} ${response.statusText}\n${errorData}`,
        );
      }

      const result = await response.json();

      console.log('게시글 작성 응답:', result); // 디버깅용 로그 추가

      // status가 0(success)이거나 'success'일 때 성공으로 처리
      if (result.status === 0 || result.status === 'success') {
        // 성공 시 알림 없이 바로 해당 게시글로 이동
        router.push(`/community/free/${result.board_id}`);
      } else {
        // 실패 시 구체적인 에러 메시지 표시
        let errorMessage = '게시글 작성 실패';
        if (result.status === 1) {
          errorMessage = 'CUID가 설정되지 않았습니다.';
        } else if (result.status === 2) {
          errorMessage = '게시글 작성에 실패했습니다.';
        } else if (result.status === 3) {
          errorMessage = '시스템 오류가 발생했습니다.';
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : '게시글 작성 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="tblComponent write">
            <table>
              <colgroup>
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <div className="title">
                      <input type="text" placeholder="제목을 입력하세요." />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text">
                    <div className="minheight100 text">
                      <SimpleEditor ref={editorRef} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 버튼그룹 */}
          <div className="btnWrap right">
            <Link href="/news/notice" className="default">
              목록
            </Link>
            <button className="default">취소</button>
            <button className="primary" onClick={handleSave}>
              등록
            </button>
          </div>
        </div>

        <SubPageLogin />
      </div>
    </div>
  );
};

export default NoticeWritePage;
