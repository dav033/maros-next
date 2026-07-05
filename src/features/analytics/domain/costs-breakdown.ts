export type CostCategory = {
  category: string;
  section: "EXPENSES" | "COGS";
  amount: number;
};

export type CostsBreakdown = {
  totalCosts: number;
  totalExpenses: number;
  totalCogs: number;
  categories: CostCategory[];
  period: {
    from: string;
    to: string;
  };
};
