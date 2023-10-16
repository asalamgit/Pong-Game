import { User } from '@/core/types/User';

export type MessageType = {
  isInfo: boolean;
  content: string;
  createdAt: Date;
  username: string;
  image: string;
  userId: number;
  isBlocked: boolean;
};

export type Channel = {
  name: string;
  description: string;
  id: string;
  type: Type;
};

export type ChannelUser = {
  username: string;
  image?: string;
  isAdmin: boolean;
  isOwner: boolean;
  isBlocked: boolean;
  isBan: boolean;
  id: number;
  state: User['state'];
};

export enum Type {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
}

export type CreateChannel = {
  name: Channel['name'];
  description: Channel['description'];
  type: Type;
  password: string;
  action?: 'create' | 'edit';
};

export enum UserActions {
  Kick,
  Ban,
  Block,
  Mute,
  SetAsAdmin,
  UnsetAsAdmin,
}
