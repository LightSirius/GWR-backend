export class BoardEsNewestPayload {
  index: string;
  size: number;
  sort: [
    {
      board_id: {
        order: string;
      };
    },
  ];
  query: {
    bool: {
      must: {
        match: {
          board_title: string;
        };
      };
      filter: [
        {
          term: {
            board_type: number;
          };
        },
      ];
    };
  };
  search_after?: [number];
  track_total_hits: boolean;
}

export class BoardEsScorePayload {
  index: string;
  size: number;
  from?: number;
  query: {
    bool: {
      must: {
        match: {
          board_title: string;
        };
      };
      filter: [
        {
          term: {
            board_type: number;
          };
        },
      ];
    };
  };
  track_total_hits: boolean;
}
