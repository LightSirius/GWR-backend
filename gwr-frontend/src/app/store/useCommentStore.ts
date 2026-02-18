import { create } from 'zustand';
import { apiFetch } from './api';

interface Comment {
  comment_id: number;
  board_id: number;
  comment_reply_id: number;
  comment_contents: string;
  author: string;
  created_at: string;
}

interface CommentListResponse {
  comment_list: Comment[];
  total_page: number;
}

interface CommentState {
  comments: Comment[];
  totalCommentPages: number;
  isSubmittingComment: boolean;

  setComments: (comments: Comment[]) => void;
  setTotalCommentPages: (total: number) => void;
  setIsSubmittingComment: (loading: boolean) => void;

  insertComment: (params: {
    board_id: number;
    comment_contents: string;
    comment_reply_id?: number;
    token: string;
    commentPage?: number;
  }) => Promise<any>; // any로 서버 응답 그대로 반환
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  totalCommentPages: 0,
  isSubmittingComment: false,

  setComments: (comments) => set({ comments }),
  setTotalCommentPages: (total) => set({ totalCommentPages: total }),
  setIsSubmittingComment: (loading) => set({ isSubmittingComment: loading }),

  insertComment: async ({
    board_id,
    comment_contents,
    comment_reply_id = 0,
    token,
    commentPage = 1,
  }) => {
    set({ isSubmittingComment: true });

    try {
      // 댓글 작성
      const insertResponse = await apiFetch('/comment/insert', {
        method: 'POST',
        auth: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          board_id,
          comment_reply_id,
          comment_contents: comment_contents.trim(),
        }),
      });

      // 댓글 작성 성공 후 목록 새로고침
      const commentsResponse = await apiFetch(
        `/comment/list/${board_id}/${commentPage}`,
        {
          method: 'GET',
        },
      );

      set({
        comments: commentsResponse.comment_list,
        totalCommentPages: commentsResponse.total_page,
      });

      // insertResponse 그대로 반환 (any 타입)
      return insertResponse;
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      throw error; // 컴포넌트에서 catch
    } finally {
      set({ isSubmittingComment: false });
    }
  },
}));
