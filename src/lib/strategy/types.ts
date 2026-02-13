export type StrategyRequest = {
  case_summary: string;
  claims?: string[];
  defenses?: string[];
  key_facts?: string[];
  goals?: string[];
  constraints?: string[];
};

export type StrategyResponse = {
  issues: { title: string; why_it_matters: string }[];
  evidence_gaps: { gap: string; how_to_fill: string }[];
  next_actions: { action: string; priority: "high" | "medium" | "low" }[];
  risks: { risk: string; mitigation: string }[];
};

export type DevilsAdvocateResponse = {
  weakest_points: { point: string; why_opponent_wins: string }[];
  counter_moves: { move: string; how_to_counter: string }[];
  questions_to_answer: string[];
  settlement_pressure_points: string[];
};
