import { Channel } from '../types/channel';

/**
 * Live Channels Data Store.
 * 
 * Empty by default — No mock channels, test streams, or fake data.
 * All channels will be loaded dynamically from Backend / Firebase Firestore.
 */
export const CHANNELS_DATA: Channel[] = [];
