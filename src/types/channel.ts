export type StreamType = 'hls' | 'embed' | 'mp4';

export type StreamQuality = '4K' | 'FHD' | 'HD' | 'SD' | 'AUTO';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  streamType: StreamType;
  categoryId: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  order?: number;
  quality?: StreamQuality;
  country?: string;
  tags?: string[];
  viewersCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export type ChannelFilter = {
  categoryId?: string;
  searchQuery?: string;
  featuredOnly?: boolean;
  liveOnly?: boolean;
};
