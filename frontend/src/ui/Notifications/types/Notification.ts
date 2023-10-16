import { User } from '@/core/types/User';
import { NotificationType } from './NotificationType';

export type Notification = {
  id: string;
  type: NotificationType;
  owner: User;
  target: User;
  updatedAt: Date;
  createdAt: Date;
};
