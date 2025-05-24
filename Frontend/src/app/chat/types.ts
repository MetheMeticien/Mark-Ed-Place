export interface User {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone_no: string;
    gender: string;
    role: string;
    created_at: string;
    university: {
      id: string;
      name: string;
      email: string;
    };
  }
  
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