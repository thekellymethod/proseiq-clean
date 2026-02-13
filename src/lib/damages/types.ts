export type DamagesCategory =
  | "medical"
  | "lost_wages"
  | "property"
  | "out_of_pocket"
  | "emotional"
  | "punitive"
  | "other";

export type DamagesLineItem = {
  category: DamagesCategory;
  label: string;
  amount: number;
};

export type DamagesRequest = {
  jurisdiction?: string | null;
  incident_date?: string | null;
  line_items: DamagesLineItem[];
  multipliers?: {
    pain_suffering?: number | null;
  } | null;
};

export type DamagesResponse = {
  totals: {
    economic: number;
    non_economic: number;
    punitive: number;
    total: number;
  };
  breakdown: {
    by_category: Record<string, number>;
    line_items: DamagesLineItem[];
    assumptions: string[];
  };
};
