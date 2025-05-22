
import { MetaEventName } from "@/hooks/useMetaTracking";

// Core event parameter interfaces
export interface BaseEventParams {
  [key: string]: any;
}

export interface CheckoutEventParams extends BaseEventParams {
  content_name: string;
  content_category?: string;
  content_ids: string[];
  value: number;
  currency: string;
  num_items?: number;
}

export interface SubscriptionEventParams extends BaseEventParams {
  content_name: string;
  value: number;
  currency: string;
  subscription_id?: string;
}

export interface LeadEventParams extends BaseEventParams {
  content_name?: string;
  content_category?: string;
  lead_type?: string;
  value?: number;
}

export interface ViewContentParams extends BaseEventParams {
  content_name: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
}

// Event payload generators with proper typing
export const createCheckoutPayload = (params: CheckoutEventParams): CheckoutEventParams => {
  return {
    content_category: 'subscription_plan',
    currency: 'USD',
    num_items: 1,
    ...params
  };
};

export const createSubscriptionPayload = (params: SubscriptionEventParams): SubscriptionEventParams => {
  return {
    currency: 'USD',
    ...params
  };
};

export const createLeadPayload = (params: LeadEventParams): LeadEventParams => {
  return {
    lead_type: 'general',
    ...params
  };
};

export const createViewContentPayload = (params: ViewContentParams): ViewContentParams => {
  return {
    ...params
  };
};

// Helper to extract numeric price from various formats
export const extractNumericPrice = (price: string): number => {
  if (!price || price === "Free" || price === "Custom") return 0;
  
  // Extract numbers from string like "$12.99"
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(numericPrice) ? 0 : numericPrice;
};

// Helper to get plan monetary value 
export const getPlanValue = (planName: string): number => {
  switch (planName) {
    case 'Boost': return 5;
    case 'Growth': return 12;
    case 'Pro': return 20;
    case 'Elite': return 499;
    default: return 0;
  }
};

// Enriches any event payload with common metadata when possible
export const enrichEventData = (eventData: BaseEventParams): BaseEventParams => {
  const enriched = { ...eventData };
  
  // Add page URL if not already present
  if (!enriched.source_url && typeof window !== 'undefined') {
    enriched.source_url = window.location.href;
  }
  
  return enriched;
};
