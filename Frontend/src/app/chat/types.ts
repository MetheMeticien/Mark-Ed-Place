import { User } from '@/types/api';

export interface ChatRoom {
  id: string;
  name: string;
  is_group: boolean;
  participant_ids: string[];
  participants: User[];
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_time: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  is_read: boolean;
  type: 'text' | 'image';
  sender: User;
}