
export type SortOption = "newest" | "alphabetical" | "discount" | "category";
export type ExploreTab = "deals" | "influencers" | "brands" | "creditcards";

export interface Influencer {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  category?: string;
  is_creditcard?: boolean;
}

export interface Deal {
  id: string;
  title: string;
  brandName: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  influencerId: string;
  category: string;
}

export interface Brand {
  name: string;
  dealCount: number;
}
