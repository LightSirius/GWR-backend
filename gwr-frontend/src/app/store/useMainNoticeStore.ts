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
  setNoticeData: (data: {
    noticeMainList: NoticeItem[];
    noticeListArray: NoticeItem[][];
  }) => void;
}

export const useMainNoticeStore = create<NoticeStore>((set) => ({
  noticeMainList: [],
  noticeList: [],
  maintenanceList: [],
  eventList: [],
  setNoticeData: (data) =>
    set({
      noticeMainList: data.noticeMainList || [],
      noticeList: data.noticeListArray?.[0] || [],
      maintenanceList: data.noticeListArray?.[1] || [],
      eventList: data.noticeListArray?.[2] || [],
    }),
}));
