import { create } from 'zustand';

export interface Notice {
  id: number;
  type: '공지' | '점검' | '이벤트' | '패치';
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  author: string;
  views: number;
  isImportant?: boolean;
}

interface NoticeState {
  notices: Notice[];
  insert: (notice: Notice) => void;
  update: (id: number, updated: Partial<Notice>) => void;
  delete: (id: number) => void;
  incrementViews: (id: number) => void;
}

export const useNoticeStore = create<NoticeState>((set) => ({
  notices: [],

  // insert
  insert: (notice: Notice) =>
    set((state) => ({ notices: [...state.notices, notice] })),

  // UPDATE
  update: (id, updated) =>
    set((state) => ({
      notices: state.notices.map((n) =>
        n.id === id ? { ...n, ...updated } : n,
      ),
    })),

  // DELETE
  delete: (id) =>
    set((state) => ({
      notices: state.notices.filter((n) => n.id !== id),
    })),

  // 조회수 증가
  incrementViews: (id) =>
    set((state) => ({
      notices: state.notices.map((n) =>
        n.id === id ? { ...n, views: n.views + 1 } : n,
      ),
    })),
}));
