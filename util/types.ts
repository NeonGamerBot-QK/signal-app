export interface Message {
  source: string;
  sourceNumber?: string;
  sourceUuid: string;
  sourceName: string;
  sourceDevice: number;
  timestamp: number;
  serverReceivedTimestamp: number;
  serverDeliveredTimestamp: number;
  dataMessage?: DataMessage;
  syncMessage?: SyncMessage;
}

export interface SyncMessage {
  sentMessage: SentMessage;
}

export interface SentMessage {
  destination: string;
  destinationNumber?: any;
  destinationUuid: string;
  timestamp: number;
  message: string;
  expiresInSeconds: number;
  viewOnce: boolean;
}

export interface DataMessage {
  timestamp: number;
  message?: string;
  expiresInSeconds: number;
  viewOnce: boolean;
  groupInfo?: GroupInfo;
  reaction?: Reaction;
}

export interface Reaction {
  emoji: string;
  targetAuthor: string;
  targetAuthorNumber: string;
  targetAuthorUuid: string;
  targetSentTimestamp: number;
  isRemove: boolean;
}

export interface GroupInfo {
  groupId: string;
  groupName: string;
  revision: number;
  type: string;
}

export interface Attachment {
  contentType: string;
  filename: string;
  id: string;
  size: number;
  width: number;
  height: number;
  caption?: any;
  uploadTimestamp: number;
}