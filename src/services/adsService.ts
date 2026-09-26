import { AdConfig, AdPlacement } from '../types/ads';

export interface IAdsService {
  getActiveAdsByPlacement(placement: AdPlacement): Promise<AdConfig[]>;
  recordImpression(adId: string): void;
  recordClick(adId: string): void;
}

/**
 * Placeholder service for future Advertising system
 */
export class PlaceholderAdsService implements IAdsService {
  async getActiveAdsByPlacement(placement: AdPlacement): Promise<AdConfig[]> {
    // Returns empty or placeholder config currently
    // Will connect to Firebase Ads / AdSense in later phase
    return [];
  }

  recordImpression(adId: string): void {
    // Analytics logging placeholder
  }

  recordClick(adId: string): void {
    // Click tracking placeholder
  }
}

export const adsService: IAdsService = new PlaceholderAdsService();
