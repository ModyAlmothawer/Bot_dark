import { Channel } from '../types/channel';
import { channelService } from './channelService';

export interface IFavoritesService {
  getFavoriteIds(): string[];
  isFavorite(channelId: string): boolean;
  toggleFavorite(channelId: string): boolean;
  addFavorite(channelId: string): void;
  removeFavorite(channelId: string): void;
  getFavoriteChannels(): Promise<Channel[]>;
  clearFavorites(): void;
  subscribe(callback: (ids: string[]) => void): () => void;
}

const STORAGE_KEY = 'shashtak_favorites_v1';

/**
 * LocalStorageFavoritesService
 * Implemented locally now, designed with identical signature for Firebase Firestore later.
 */
export class LocalStorageFavoritesService implements IFavoritesService {
  private listeners: Set<(ids: string[]) => void> = new Set();

  getFavoriteIds(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to read favorites from localStorage:', e);
      return [];
    }
  }

  private save(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      this.notify(ids);
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }

  private notify(ids: string[]): void {
    this.listeners.forEach((callback) => callback(ids));
  }

  subscribe(callback: (ids: string[]) => void): () => void {
    this.listeners.add(callback);
    // Initial notify
    callback(this.getFavoriteIds());
    return () => {
      this.listeners.delete(callback);
    };
  }

  isFavorite(channelId: string): boolean {
    const ids = this.getFavoriteIds();
    return ids.includes(channelId);
  }

  toggleFavorite(channelId: string): boolean {
    const ids = this.getFavoriteIds();
    const exists = ids.includes(channelId);
    let newIds: string[];
    if (exists) {
      newIds = ids.filter((id) => id !== channelId);
    } else {
      newIds = [...ids, channelId];
    }
    this.save(newIds);
    return !exists;
  }

  addFavorite(channelId: string): void {
    const ids = this.getFavoriteIds();
    if (!ids.includes(channelId)) {
      this.save([...ids, channelId]);
    }
  }

  removeFavorite(channelId: string): void {
    const ids = this.getFavoriteIds();
    this.save(ids.filter((id) => id !== channelId));
  }

  async getFavoriteChannels(): Promise<Channel[]> {
    const ids = this.getFavoriteIds();
    if (ids.length === 0) return [];
    
    const allChannels = await channelService.getChannels();
    return allChannels.filter((ch) => ids.includes(ch.id));
  }

  clearFavorites(): void {
    this.save([]);
  }
}

export const favoritesService: IFavoritesService = new LocalStorageFavoritesService();
