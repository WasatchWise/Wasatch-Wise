export interface FilterState {
  cuisine: string;
  price: string;
  location: string;
  vibe: string;
}

export interface RestaurantResult {
  name: string;
  description: string;
  rating?: string;
  address?: string;
  mapLink?: string;
  sourceChunks?: GroundingChunk[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
        author: string;
      }[];
    }[];
  };
}

export enum SlotState {
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  STOPPING = 'STOPPING',
  WINNER = 'WINNER',
  ERROR = 'ERROR'
}
