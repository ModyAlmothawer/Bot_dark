import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Channel, ChannelFilter } from '../types/channel';

export const CHANNELS_COLLECTION = 'channels';

/**
 * Maps raw Firestore error codes to clear, user-friendly Arabic messages
 */
export function formatFirestoreError(error: unknown): string {
  if (!error) return 'حدث خطأ غير معروف في الاتصال بقاعدة البيانات.';
  
  const err = error as { code?: string; message?: string };
  const code = err?.code || '';
  const msg = err?.message || String(error);

  if (
    code === 'permission-denied' ||
    msg.includes('permission-denied') ||
    msg.includes('Missing or insufficient permissions')
  ) {
    return 'ليس لديك صلاحية للوصول إلى بيانات القنوات (Permission Denied). يرجى مراجعة إعدادات وقواعد الأمان في Firebase Firestore.';
  }

  if (
    code === 'unavailable' ||
    msg.includes('offline') ||
    msg.includes('unavailable') ||
    msg.includes('failed to get document because the client is offline')
  ) {
    return 'تعذر الاتصال بخدمة Firebase، يرجى التحقق من اتصال الإنترنت وحالة خادم Firestore.';
  }

  if (code === 'not-found') {
    return 'لم يتم العثور على مستند القناة المطلوب في قاعدة البيانات.';
  }

  if (code === 'resource-exhausted' || msg.includes('Quota exceeded')) {
    return 'تم تجاوز الحصة المسموح بها في قاعدة بيانات Firestore (Quota Exceeded).';
  }

  return `خطأ في الاتصال بقاعدة البيانات: ${msg}`;
}

/**
 * Safely parses Firestore Timestamp, date string, or seconds into an ISO 8601 string
 */
function parseTimestamp(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof val === 'string') {
    return val;
  }
  if (typeof (val as { seconds?: number }).seconds === 'number') {
    return new Date((val as { seconds: number }).seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

/**
 * Maps a Firestore document snapshot to the strict Channel interface
 */
export function mapDocToChannel(
  docSnap: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData | undefined }
): Channel {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    name: data.name || '',
    logo: data.logo || '',
    streamUrl: data.streamUrl || '',
    streamType: data.streamType || 'hls',
    categoryId: data.categoryId || 'general',
    description: data.description || '',
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    isFeatured: Boolean(data.isFeatured),
    order: typeof data.order === 'number' ? data.order : 99,
    quality: data.quality || 'HD',
    country: data.country || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    viewersCount: typeof data.viewersCount === 'number' ? data.viewersCount : 0,
    createdAt: parseTimestamp(data.createdAt),
    updatedAt: data.updatedAt ? parseTimestamp(data.updatedAt) : undefined,
  };
}

export interface IChannelService {
  getChannels(filter?: ChannelFilter): Promise<Channel[]>;
  getChannelById(id: string): Promise<Channel | null>;
  getFeaturedChannels(): Promise<Channel[]>;
  getLiveChannels(): Promise<Channel[]>;
  getChannelsByCategory(categoryId: string): Promise<Channel[]>;
  searchChannels(query: string): Promise<Channel[]>;
  subscribeToChannels(
    onData: (channels: Channel[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe;
  createChannel(channel: Omit<Channel, 'id' | 'createdAt'>): Promise<Channel>;
  updateChannel(id: string, channel: Partial<Channel>): Promise<Channel>;
  deleteChannel(id: string): Promise<boolean>;
  toggleChannelStatus(id: string, isActive: boolean): Promise<boolean>;
  toggleFeaturedStatus(id: string, isFeatured: boolean): Promise<boolean>;
}

/**
 * ChannelService
 * Pure Firestore-backed service layer using modern Modular SDK.
 * Reads, writes, and listens in real-time to the 'channels' collection in Firebase Firestore.
 */
export class ChannelService implements IChannelService {
  private colRef = collection(db, CHANNELS_COLLECTION);

  /**
   * Realtime listener using Firestore onSnapshot
   * Allows visitors to receive channel additions, edits, and deletions instantly.
   */
  subscribeToChannels(
    onData: (channels: Channel[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      return onSnapshot(
        this.colRef,
        (snapshot) => {
          const channels: Channel[] = [];
          snapshot.forEach((d) => {
            channels.push(mapDocToChannel(d));
          });
          channels.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          onData(channels);
        },
        (error) => {
          console.warn('Firestore channels subscription error:', error);
          const isPermissionDenied =
            (error as { code?: string })?.code === 'permission-denied' ||
            error.message?.includes('permission-denied') ||
            error.message?.includes('Missing or insufficient permissions');

          if (isPermissionDenied) {
            // Provide clean empty list so the app renders the Empty State gracefully
            onData([]);
            return;
          }

          const friendlyMessage = formatFirestoreError(error);
          if (onError) {
            onError(new Error(friendlyMessage));
          }
        }
      );
    } catch (error) {
      console.warn('Error starting Firestore channels subscription:', error);
      const isPermissionDenied =
        (error as { code?: string })?.code === 'permission-denied' ||
        (error as Error)?.message?.includes('permission-denied') ||
        (error as Error)?.message?.includes('Missing or insufficient permissions');

      if (isPermissionDenied) {
        onData([]);
        return () => {};
      }

      const friendlyMessage = formatFirestoreError(error);
      if (onError) {
        onError(new Error(friendlyMessage));
      }
      return () => {};
    }
  }

  /**
   * Fetch all channels from Firestore with optional filtering
   */
  async getChannels(filter?: ChannelFilter): Promise<Channel[]> {
    try {
      const snapshot = await getDocs(this.colRef);
      let channels: Channel[] = [];
      snapshot.forEach((d) => {
        channels.push(mapDocToChannel(d));
      });

      // Filter active channels unless filter specifies otherwise
      channels = channels.filter((c) => c.isActive);

      if (filter?.categoryId && filter.categoryId !== 'all') {
        channels = channels.filter((c) => c.categoryId === filter.categoryId);
      }

      if (filter?.featuredOnly) {
        channels = channels.filter((c) => c.isFeatured);
      }

      if (filter?.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.trim().toLowerCase();
        channels = channels.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }

      return channels.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    } catch (error) {
      const isPermissionDenied =
        (error as { code?: string })?.code === 'permission-denied' ||
        (error as Error)?.message?.includes('permission-denied') ||
        (error as Error)?.message?.includes('Missing or insufficient permissions');

      if (isPermissionDenied) {
        console.warn('[Firestore getChannels]: Permission denied or rules pending. Returning empty list.');
        return [];
      }

      console.error('Error fetching channels from Firestore:', error);
      throw new Error(formatFirestoreError(error));
    }
  }

  /**
   * Fetch a single channel document by ID from Firestore
   */
  async getChannelById(id: string): Promise<Channel | null> {
    try {
      if (!id) return null;
      const docRef = doc(db, CHANNELS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return null;
      }
      return mapDocToChannel(docSnap);
    } catch (error) {
      console.error(`Error fetching channel ${id} from Firestore:`, error);
      throw new Error(formatFirestoreError(error));
    }
  }

  /**
   * Create a new channel document in Firestore
   */
  async createChannel(channelData: Omit<Channel, 'id' | 'createdAt'>): Promise<Channel> {
    try {
      const nowIso = new Date().toISOString();
      const payload = {
        name: channelData.name.trim(),
        logo: channelData.logo?.trim() || '',
        streamUrl: channelData.streamUrl.trim(),
        streamType: channelData.streamType || 'hls',
        categoryId: channelData.categoryId || 'general',
        description: channelData.description?.trim() || '',
        isActive: channelData.isActive !== undefined ? channelData.isActive : true,
        isFeatured: Boolean(channelData.isFeatured),
        order: typeof channelData.order === 'number' ? channelData.order : 99,
        quality: channelData.quality || 'HD',
        country: channelData.country || '',
        tags: Array.isArray(channelData.tags) ? channelData.tags : [],
        viewersCount: typeof channelData.viewersCount === 'number' ? channelData.viewersCount : 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const docRef = await addDoc(this.colRef, payload);
      return {
        ...payload,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating channel in Firestore:', error);
      throw new Error(formatFirestoreError(error));
    }
  }

  /**
   * Update an existing channel document in Firestore
   */
  async updateChannel(id: string, data: Partial<Channel>): Promise<Channel> {
    try {
      const docRef = doc(db, CHANNELS_COLLECTION, id);
      const updatePayload: Record<string, unknown> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      delete updatePayload.id;

      await updateDoc(docRef, updatePayload);
      const updated = await this.getChannelById(id);
      if (!updated) {
        throw new Error('لم يتم العثور على القناة بعد التحديث');
      }
      return updated;
    } catch (error) {
      console.error(`Error updating channel ${id} in Firestore:`, error);
      throw new Error(formatFirestoreError(error));
    }
  }

  /**
   * Delete a channel document from Firestore
   */
  async deleteChannel(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, CHANNELS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting channel ${id} from Firestore:`, error);
      throw new Error(formatFirestoreError(error));
    }
  }

  /**
   * Toggle the active state of a channel in Firestore
   */
  async toggleChannelStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const docRef = doc(db, CHANNELS_COLLECTION, id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error(`Error toggling channel status for ${id}:`, error);
      throw new Error(formatFirestoreError(error));
    }
  }

  /**
   * Toggle the featured state of a channel in Firestore
   */
  async toggleFeaturedStatus(id: string, isFeatured: boolean): Promise<boolean> {
    try {
      const docRef = doc(db, CHANNELS_COLLECTION, id);
      await updateDoc(docRef, {
        isFeatured,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error(`Error toggling channel featured status for ${id}:`, error);
      throw new Error(formatFirestoreError(error));
    }
  }

  /**
   * Featured channels query
   */
  async getFeaturedChannels(): Promise<Channel[]> {
    const all = await this.getChannels();
    return all.filter((c) => c.isActive && c.isFeatured);
  }

  /**
   * Live/Active channels query
   */
  async getLiveChannels(): Promise<Channel[]> {
    const all = await this.getChannels();
    return all.filter((c) => c.isActive);
  }

  /**
   * Category channels query
   */
  async getChannelsByCategory(categoryId: string): Promise<Channel[]> {
    return this.getChannels({ categoryId });
  }

  /**
   * Search query
   */
  async searchChannels(query: string): Promise<Channel[]> {
    return this.getChannels({ searchQuery: query });
  }
}

// Export singleton instance of ChannelService
export const channelService: IChannelService = new ChannelService();
