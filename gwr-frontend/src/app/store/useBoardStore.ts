'use client';

import { create } from 'zustand';
import { apiFetch } from './api';

// 게시글 타입
export interface Post {
  board_id: number;
  board_title: string;
  user_name: string;
  info_delete: boolean;
  info_block: boolean;
  create_date: string;
  comment_count: number;
  view_count: number;
  recommend_count: number;
}

// 게시글 검색 요청 타입
export interface BoardSearch {
  board_type: number; // 게시판 종류 (0: 자유, 1: 공략 등)
  board_category: number; // 카테고리 (0: 전체)
  search_page: number; // 페이지 번호
  search_string?: string; // 검색어
  search_type?: number; // 검색 조건 (0: 제목, 1: 내용, 2: 작성자)
  search_size: number; // 페이지당 개수
  sort_type: number; // 정렬 (0: 최신순, 1: 추천순)
}

// 게시글 검색 응답 타입
export interface BoardSearchResponse {
  total_count: number;
  board_summary: Post[];
}

// 게시글 상세 타입
export interface BoardDetail {
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

// 게시글 등록/수정용 타입
export interface BoardInsert {
  board_id?: number;
  board_type: number;
  board_category: number;
  board_title: string;
  board_contents: string;
  info_delete: boolean;
  info_block: boolean;
}

// 게시글 삭제용 타입
export interface BoardDelete {
  board_id: number;
}

// 코멘트 타입
interface Comment {
  comment_id: number;
  comment_reply_id: number;
  comment_contents: string;
  is_delete: boolean;
  create_date: string;
  user_name: string;
}

// 코멘트 리스트 타입
interface CommentListResponse {
  total_page: number;
  comment_list: Comment[];
}

// Zustand 상태 인터페이스
interface BoardState {
  posts: Post[];
  totalCount: number;
  isLoading: boolean;

  paging: {
    curPage: number;
    pageRowCount: number;
  };
  setPaging: (
    pageObj: Partial<{ curPage: number; pageRowCount: number }>,
  ) => void;

  commentPaging: {
    curPage: number;
    pageRowCount: number;
  };
  setCommentPaging: (
    pageObj: Partial<{ curPage: number; pageRowCount: number }>,
  ) => void;

  selectedBoard?: BoardInsert;
  setSelectedBoard: (board?: BoardInsert) => void;

  search: (params: BoardSearch) => Promise<Post[]>; // 게시글 목록 검색
  getDetail: (board_id: number) => Promise<BoardDetail>; // 게시글 상세
  boardInsert: (board: BoardInsert) => Promise<any>; // 게시글 등록
  boardUpdate: (board: BoardInsert) => Promise<any>; // 게시글 수정
  boardDelete: (board: BoardDelete) => Promise<any>; // 게시글 삭제

  // 코멘트 목록
  getCommentList: (
    board_id: number,
    page: number,
  ) => Promise<CommentListResponse>;
  // 코멘트 등록
  writeComment: (
    board_id: number,
    comment_contents: string,
    comment_reply_id?: number,
  ) => Promise<any>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  posts: [],
  totalCount: 0,
  isLoading: false,

  paging: {
    curPage: 1,
    pageRowCount: 10,
  },
  setPaging: (pageObj) =>
    set((state) => ({
      paging: { ...state.paging, ...pageObj },
    })),

  commentPaging: {
    curPage: 1,
    pageRowCount: 10,
  },
  setCommentPaging: (pageObj) =>
    set((state) => ({
      paging: { ...state.paging, ...pageObj },
    })),

  selectedBoard: undefined,
  setSelectedBoard: (board) => set(() => ({ selectedBoard: board })),

  // 게시글 목록 검색
  search: async (params: BoardSearch): Promise<Post[]> => {
    set({ isLoading: true });
    try {
      const data: BoardSearchResponse = await apiFetch('/board/search', {
        method: 'POST',
        body: JSON.stringify(params),
        useAuth: false,
      });

      const list = data?.board_summary ?? [];
      set({
        posts: list,
        totalCount: data?.total_count ?? 0,
      });

      return list;
    } catch (err) {
      console.error('게시글 검색 실패:', err);
      set({ posts: [], totalCount: 0 });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 게시글 상세보기
  getDetail: async (board_id: number): Promise<BoardDetail> => {
    set({ isLoading: true });
    try {
      const data: BoardDetail = await apiFetch(`/board/detail/${board_id}`, {
        method: 'GET',
        useAuth: false,
      });
      return data;
    } catch (err) {
      console.error('게시글 상세 조회 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 게시글 등록
  boardInsert: async (board: BoardInsert): Promise<any> => {
    set({ isLoading: true });
    try {
      const data = await apiFetch('/board/insert', {
        method: 'POST',
        useAuth: true,
        body: JSON.stringify(board),
      });
      return data;
    } catch (err) {
      console.error('게시글 등록 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 게시글 수정
  boardUpdate: async (board: BoardInsert): Promise<any> => {
    if (!board.board_id) throw new Error('board_id가 없습니다.');
    set({ isLoading: true });
    try {
      const data = await apiFetch(`/board/update`, {
        method: 'POST',
        useAuth: true,
        body: JSON.stringify(board),
      });

      if (data && typeof data === 'object') {
        set((state) => ({
          posts: state.posts.map((b) =>
            b.board_id === board.board_id ? { ...b, ...data } : b,
          ),
        }));
      }

      return data;
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 게시글 삭제
  boardDelete: async (board: BoardDelete): Promise<any> => {
    if (!board.board_id) throw new Error('board_id가 없습니다.');
    set({ isLoading: true });
    try {
      const data = await apiFetch(`/board/delete`, {
        method: 'POST',
        useAuth: true,
        body: JSON.stringify(board),
      });

      if (data && typeof data === 'object') {
        set((state) => ({
          posts: state.posts.filter((b) => b.board_id !== board.board_id),
        }));
      }

      return data;
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 코멘트 목록
  getCommentList: async (board_id, page): Promise<CommentListResponse> => {
    set({ isLoading: true });
    try {
      const data: CommentListResponse = await apiFetch(
        `/comment/list/${board_id}/${page}`,
        {
          method: 'GET',
          useAuth: false,
        },
      );

      return data;
    } catch (err) {
      console.error('코멘트 리스트 불러오기 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  writeComment: async (
    board_id: number,
    comment_contents: string,
    comment_reply_id = 0,
  ): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await apiFetch(`/comment/write`, {
        method: 'POST',
        useAuth: true, // 댓글 작성은 로그인 필요하므로 true
        body: JSON.stringify({
          board_id,
          comment_contents,
          comment_reply_id, // 대댓글이면 부모 comment_id, 일반 댓글이면 0
        }),
      });

      // 성공 시 목록 새로고침
      const { getCommentList } = get();
      await getCommentList(board_id, 1);
      return response;
    } catch (err) {
      console.error('댓글 등록 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
