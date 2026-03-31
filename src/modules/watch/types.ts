export type WatchPreferences = {
  preferredKeywords: string[];
  excludedKeywords: string[];
  conditionFilters: string[];
};

export type NormalizedListing = {
  ebayItemId: string;
  title: string;
  price?: number;
  url: string;
  sellerName?: string;
  sellerFeedbackPercent?: number;
  condition?: string;
  location?: string;
  buyItNow?: boolean;
  metadata: Record<string, unknown>;
};

export type ScoreReason = {
  type: string;
  impact: number;
  detail: string;
};

export type ScoreResult = {
  score: number;
  explanation: string;
  reasons: ScoreReason[];
};
