export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  description?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  features: string[];
  pricing: PricingTier[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContactInfo {
  wechat: string;
  qrCodePath: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  keywords: string[];
}