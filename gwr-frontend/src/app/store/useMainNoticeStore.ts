import { create } from 'zustand';

interface NoticeItem {
  notice_id: number;
  notice_type: number;
  notice_title: string;
  create_date: string;
}

interface NoticeStore {
  noticeMainList: NoticeItem[];
  noticeList: NoticeItem[];
  maintenanceList: NoticeItem[];
  eventList: NoticeItem[];
  isLoading: boolean;
  setNoticeData: (data: {
    noticeMainList: NoticeItem[];
    noticeListArray: NoticeItem[][];
  }) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useMainNoticeStore = create<NoticeStore>((set) => ({
  noticeMainList: [],
  noticeList: [],
  maintenanceList: [],
  eventList: [],
  isLoading: false,
  setNoticeData: (data) =>
    set({
      noticeMainList: data.noticeMainList || [],
      noticeList: data.noticeListArray?.[0] || [],
      maintenanceList: data.noticeListArray?.[1] || [],
      eventList: data.noticeListArray?.[2] || [],
    }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
