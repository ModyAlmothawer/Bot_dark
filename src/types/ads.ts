/**
 * Contracts for future Ad Management Integration
 */
export type AdPlacement = 'home_banner' | 'player_sidebar' | 'interstitial' | 'category_sponsor';

export interface AdConfig {
  id: string;
  title: string;
  placement: AdPlacement;
  imageUrl?: string;
  targetUrl?: string;
  isActive: boolean;
  sponsorName?: string;
}
