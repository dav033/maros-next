export type QuickbooksReportRow = {
  reportName: string;
  section: string;
  group: string;
  label: string;
  columns: Record<string, string>;
  amount: number;
  entityId?: string;
  depth: number;
  path: string[];
};

export type QuickbooksParsedReport = {
  reportName: string;
  rows: QuickbooksReportRow[];
  summary: Record<string, number>;
  coverage: {
    start: string;
    end: string;
    dateChunks: Array<{ start: string; end: string }>;
  };
};
