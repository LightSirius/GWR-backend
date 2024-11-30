export class BoardListPayload {
  index: string;
  size: number;
  from?: number;
  sort?: [
    {
      board_id?: {
        order: string;
      };
    },
  ];
  query: {
    bool: {
      must?: {
        match?: {
          board_title?: string;
          board_contents?: string;
          user_name?: string;
        };
      };
      filter: [
        {
          term: {
            board_category: number;
          };
        },
      ];
    };
  };
  track_total_hits: boolean;
}
