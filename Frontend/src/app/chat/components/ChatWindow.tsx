'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatRoom, Message } from '../types';
import { useAuthContext } from '@/components/providers/auth-provider';
import Image from 'next/image';
import { Image as ImageIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = 'mark-ed-place';
const CLOUDINARY_CLOUD_NAME = 'du2tvwrgx';
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/du2tvwrgx/image/upload';

interface ChatWindowProps {
  chat: ChatRoom;
  messages: Message[];
  onSendMessage: (content: string, imageUrl?: string) => void;
  isLoading?: boolean;
}

export default function ChatWindow({ chat, messages, onSendMessage, isLoading = false }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuthContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Set up WebSocket connection for this chat
    const chatWs = new WebSocket(`ws://${process.env.NEXT_PUBLIC_SERVER_URL}/chat/ws/${chat.id}`);
    chatWs.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      // Handle new message
      if (newMessage.chat_id === chat.id) {
        onSendMessage('', ''); // Trigger a refresh of messages
      }
    };
    setWs(chatWs);

    return () => {
      chatWs.close();
    };
  }, [chat.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary error response:', errorData);
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      if (data.secure_url) {
        onSendMessage('', data.secure_url);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('No secure URL in response');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // You might want to show a toast notification here
    } finally {
      setIsUploading(false);
    }
  };

  const getChatName = () => {
    if (chat.is_group) {
      return chat.name;
    }
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    return otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Unknown User';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const LoadingSkeleton = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-end space-x-2 max-w-[70%]">
            {i % 2 === 0 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            )}
            <div className={`rounded-2xl p-3 ${
              i % 2 === 0 ? 'bg-primary/20' : 'bg-muted/20'
            }`}>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-16 mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b bg-card">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full ${getAvatarColor(chat.id)} flex items-center justify-center text-white font-semibold`}>
            {chat.is_group ? (
              <span className="text-lg">👥</span>
            ) : (
              <span>{getInitials(getChatName())}</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{getChatName()}</h2>
            <p className="text-sm text-muted-foreground">
              {chat.is_group ? `${chat.participants.length} participants` : 'Direct message'}
            </p>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {[...messages]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end space-x-2 max-w-[70%]">
                {msg.sender_id !== user?.id && (
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.sender_id)} flex items-center justify-center text-white text-xs`}>
                    {getInitials(`${msg.sender.first_name} ${msg.sender.last_name}`)}
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3 ${
                    msg.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.type === 'image' && msg.image_url && (
                    <div className="mb-2">
                      <Image
                        src={msg.image_url}
                        alt="Shared image"
                        width={300}
                        height={300}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </Button>
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!message.trim()}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
} 