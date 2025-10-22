'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/layout/Loading';
import SubPageLogin from '@/components/layout/SubPageLogin';
import SubPageTitle from '@/components/layout/SubPageTitle';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { NoticeInsert, useNoticeStore } from '@/app/store/useNoticeStore';
import { Checkbox, NativeSelect } from '@chakra-ui/react';

const NoticeWritePage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const { insert, update, selectedNotice, setSelectedNotice } =
    useNoticeStore();

  const searchParams = useSearchParams();
  const boardId = searchParams.get('id'); // 수정할 id
  const editorRef = useRef<any>(null); // 에디터 ref

  useEffect(() => {
    // 새 글쓰기라면 초기화
    if (!boardId) {
      // id 쿼리가 없으면 새 글쓰기
      setSelectedNotice(undefined);
    }
  }, [boardId]);

  const [formData, setFormData] = useState<NoticeInsert>({
    notice_type: 0,
    notice_title: '',
    notice_contents: '',
    notice_contents_es: '',
    notice_fix: false,
    info_delete: false,
  });

  useEffect(() => {
    if (selectedNotice) {
      setFormData({
        notice_type: selectedNotice.notice_type,
        notice_title: selectedNotice.notice_title,
        notice_contents: selectedNotice.notice_contents,
        notice_contents_es: selectedNotice.notice_contents_es ?? '',
        notice_fix: selectedNotice.notice_fix ?? false,
        info_delete: false,
      });
    } else {
      setFormData({
        notice_type: 0,
        notice_title: '',
        notice_contents: '',
        notice_contents_es: '',
        notice_fix: false,
        info_delete: false,
      });

      editorRef.current?.clear();
    }
  }, [selectedNotice]);

  // 필드 변경시
  const handleChange = (key: keyof NoticeInsert, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
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

  // 저장
  const handleSave = () => {
    if (!editorRef.current) return;
    const editorHtml = editorRef.current?.getHTML() ?? '';
    const editorText = editorRef.current?.getText() ?? '';

    const newData = {
      ...formData,
      notice_contents: editorHtml,
      notice_contents_es: editorText,
      ...(boardId ? { notice_id: Number(boardId) } : {}), // boardId가 있으면 notice_id 추가
    };

    setFormData(newData);

    // 검증
    if (!handleValidate(newData)) return;

    // 저장
    handleSubmit(newData);
  };

  // 검증
  const handleValidate = (newData: any): boolean => {
    if (!accessToken) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      router.push('/login');
      return false; // 실패
    }

    if (!newData.notice_title.trim()) {
      alert('제목을 입력해주세요.');
      return false; // 실패
    }

    if (!newData.notice_contents.trim()) {
      alert('내용을 입력해주세요.');
      return false; // 실패
    }

    return true; // 통과
  };

  const handleSubmit = async (newData: any) => {
    // console.log('데이터', newData);

    try {
      let result: any;

      if (boardId) {
        // 수정
        result = await update(newData);
      } else {
        // 등록
        result = await insert(newData);
      }

      // status가 0(success)이거나 'success'일 때 성공으로 처리
      if (result.status === 0 || result.status === 'success') {
        let message = boardId
          ? '게시글 수정에 성공했습니다.'
          : '게시글 등록에 성공했습니다.';

        alert(message);
        // 성공 시 해당 게시글로 이동
        router.push(`/news/notice/${result.notice_id}`);
      } else {
        // 실패 시 구체적인 에러 메시지 표시
        let errorMessage = boardId
          ? '공지사항 수정 실패'
          : '공지사항 등록 실패';

        if (result.status === 1) {
          errorMessage = 'CUID가 설정되지 않았습니다.';
        } else if (result.status === 2) {
          errorMessage = boardId
            ? '공지사항 수정에 실패했습니다.'
            : '공지사항 등록에 실패했습니다.';
        } else if (result.status === 3) {
          errorMessage = '시스템 오류가 발생했습니다.';
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error('공지사항 처리 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : '공지사항 처리 중 오류가 발생했습니다.',
      );
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
                      <NativeSelect.Root size="sm" width="120px">
                        <NativeSelect.Field
                          value={formData.notice_type}
                          onChange={(e) => {
                            handleChange('notice_type', Number(e.target.value));
                          }}
                        >
                          <option value={1}>공지</option>
                          <option value={2}>점검</option>
                          <option value={3}>이벤트</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                      <input
                        type="text"
                        placeholder="제목을 입력하세요."
                        value={formData.notice_title}
                        onChange={(e) => {
                          handleChange('notice_title', e.target.value);
                        }}
                      />
                      {/* 
                      <Checkbox.Root
                        variant="outline"
                        width="120px"
                        checked={formData.notice_fix || false}
                        onCheckedChange={(e) => {
                          handleChange('notice_fix', e.checked);
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label>상단 고정</Checkbox.Label>
                      </Checkbox.Root> */}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text">
                    <div className="minheight100 text">
                      <SimpleEditor
                        ref={editorRef}
                        initialContent={selectedNotice?.notice_contents || ''}
                      />
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
