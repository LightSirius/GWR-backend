// frontend/app/api/useNoticeStore.ts
import { create } from 'zustand';
import { apiFetch } from './api';

// 공지 등록/수정용 타입
export interface NoticeInsert {
  notice_id?: number;
  notice_type: number; // 공지 유형 (0: 공지, 1: 점검, 2: 이벤트 등)
  notice_title: string; // 공지 제목
  notice_contents: string; // 공지 내용
  notice_contents_es?: string; // 엘라스틱 서치용 (선택)
  notice_thumbnail?: string; // 공지 썸네일 URL (선택)
  info_delete: boolean;
  notice_fix?: boolean; // 공지 고정 여부 (true: 상단 고정)
}
// 공지 삭제용 타입
export interface NoticeDelete {
  notice_id?: number;
}

// 공지 검색 요청용 타입
export interface NoticeSearch {
  notice_type: number; // 공지 유형 (0: 전체, 1: 점검, 2: 이벤트, 3: 패치)
  search_page: number; // 검색할 페이지 번호 (0부터 시작)
  search_string: string; // 검색어
  search_type: number; // 검색 타입 (예: 0: 제목, 1: 내용, 2: 작성자 등)
  search_size: number; // 페이지당 개수
  sort_type: number; // 정렬 방식 (예: 0: 최신순, 1: 정확도순)
}

// 목록 타입
export interface NoticeSummary {
  notice_id: number; // 공지 ID
  notice_title: string; // 공지 제목
  notice_type: number; // 공지 유형
  create_date: string; // 작성일 (ISO 형식)
  notice_thumbnail: string; // 썸네일 경로 또는 "없음"
  comment_count: number; // 댓글 수
  view_count: number; // 조회수
  recommend_count: number; // 추천 수
}

export interface NoticeSearchResponse {
  total_count: number; // 총 개수
  notice_summary: NoticeSummary[]; // 공지 요약 목록
}

// 상세보기
export interface NoticeDetail {
  notice_id: number;
  notice_type: number | string;
  notice_title: string;
  notice_contents: string;
  update_date: string;
  view_count: number;
  comment_count: number;
  recommend_count: number;
  near_notice_list?: Record<
    string,
    {
      notice_id: number;
      notice_type: number | string;
      notice_title: string;
      create_date: string;
    }
  >;
}

// Zustand 상태 인터페이스 (정리)
interface NoticeState {
  notices: NoticeSummary[];
  totalCount: number; // 전체 개수
  isLoading: boolean; // 로딩 상태
  selectedNotice?: NoticeInsert;
  setSelectedNotice: (notice?: NoticeInsert) => void;
  paging: {
    curPage: number;
    pageRowCount: number;
  };
  setPaging: (
    pageObject: Partial<{ curPage: number; pageRowCount: number }>,
  ) => void;

  search: (params: NoticeSearch) => Promise<NoticeSummary[]>; // 공지 검색
  insert: (notice: NoticeInsert) => Promise<any>; // 공지 추가 (서버 응답 그대로 반환)
  getDetail: (notice_id: number) => Promise<NoticeDetail>;
  update: (notice: NoticeInsert) => Promise<any>; // 공지 수정
  noticeDelete: (notice: NoticeDelete) => Promise<any>; // 공지 삭제
}

export const useNoticeStore = create<NoticeState>((set, get) => ({
  notices: [],
  totalCount: 0,
  isLoading: false,

  // 페이징 상태
  paging: {
    curPage: 1,
    pageRowCount: 999999,
  },
  setPaging: (pageObject) =>
    set((state) => ({
      paging: {
        ...state.paging,
        ...pageObject,
      },
    })),

  selectedNotice: undefined,
  setSelectedNotice: (notice) =>
    set(() => ({
      selectedNotice: notice,
    })),

  // 공지 검색
  search: async (params: NoticeSearch): Promise<NoticeSummary[]> => {
    set({ isLoading: true });
    try {
      const data: NoticeSearchResponse = await apiFetch('/notice/search', {
        method: 'POST',
        body: JSON.stringify(params),
        useAuth: false,
      });

      // 서버 응답에 맞게 상태 업데이트
      const list = data?.notice_summary ?? [];
      set({
        notices: list,
        totalCount: data?.total_count ?? 0,
      });

      return list;
    } catch (err) {
      console.error('공지 검색 실패:', err);
      // 실패 시 빈 배열로 반환하고 상태 초기화
      set({ notices: [], totalCount: 0 });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 상세보기
  getDetail: async (notice_id: number): Promise<NoticeDetail> => {
    set({ isLoading: true });
    try {
      const data: NoticeDetail = await apiFetch(`/notice/detail/${notice_id}`, {
        method: 'GET',
        useAuth: false,
      });

      return data;
    } catch (err) {
      console.error('공지 상세 조회 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 공지 등록
  insert: async (notice: NoticeInsert): Promise<any> => {
    set({ isLoading: true });
    try {
      const data = await apiFetch('/notice/insert', {
        method: 'POST',
        useAuth: true,
        body: JSON.stringify(notice),
      });

      // 서버에서 새로운 notice_id를 반환하면(예: { status:0, notice_id: 123 })
      // 필요하면 여기서 notices 상태에 새 항목을 추가할 수 있지만,
      // 보통은 검색 API로 목록을 다시 가져오거나 서버가 반환한 상세 데이터를 이용합니다.
      return data;
    } catch (err) {
      console.error('공지 등록 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 공지 수정
  update: async (notice: NoticeInsert): Promise<any> => {
    if (!notice.notice_id) {
      throw new Error();
    }

    set({ isLoading: true });

    try {
      // 서버 요청
      const data = await apiFetch(`/notice/update`, {
        method: 'POST',
        useAuth: true,
        body: JSON.stringify(notice),
      });

      // 서버가 수정된 데이터(또는 일부)를 반환하면 상태 업데이트
      if (data && typeof data === 'object') {
        set((state) => ({
          notices: state.notices.map((n) =>
            n.notice_id === notice.notice_id ? { ...n, ...data } : n,
          ),
        }));
      }

      return data;
    } catch (err) {
      console.error('공지 수정 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 공지 삭제
  noticeDelete: async (notice: NoticeDelete): Promise<any> => {
    set({ isLoading: true });
    if (!notice.notice_id) {
      throw new Error();
    }

    set({ isLoading: true });

    try {
      // 서버 요청
      const data = await apiFetch(`/notice/delete`, {
        method: 'POST',
        useAuth: true,
        body: JSON.stringify(notice),
      });

      // 서버가 수정된 데이터(또는 일부)를 반환하면 상태 업데이트
      if (data && typeof data === 'object') {
        set((state) => ({
          notices: state.notices.map((n) =>
            n.notice_id === notice.notice_id ? { ...n, ...data } : n,
          ),
        }));
      }

      return data;
    } catch (err) {
      console.error('삭제 실패:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
