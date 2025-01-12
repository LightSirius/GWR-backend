export class NoticeEsSearchPayload {
  index: string;
  size: number;
  from?: number;
  sort?: [
    {
      notice_id?: {
        order: string;
      };
    },
  ];
  query: {
    bool: {
      must?: {
        match?: {
          notice_title?: string;
          notice_contents?: string;
          user_name?: string;
        };
      };
      filter: [
        {
          term: {
            notice_type: number;
          };
        },
      ];
    };
  };
  track_total_hits: boolean;
}
