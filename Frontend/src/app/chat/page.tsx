'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/providers/auth-provider';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { ChatRoom, Message } from './types';
import { MarketplaceNavbar } from '@/components/marketplace/marketplace-navbar';

export default function ChatPage() {
  const { user } = useAuthContext();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
      
      const userWs = new WebSocket(`ws://${process.env.NEXT_PUBLIC_SERVER_URL}/chat/ws/user/${user.id}`);
      userWs.onmessage = (event) => {
        const update = JSON.parse(event.data);
        setChatRooms(prev => {
          const index = prev.findIndex(chat => chat.id === update.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...update };
            return updated;
          }
          return prev;
        });
      };
      setWs(userWs);

      return () => {
        userWs.close();
      };
    }
  }, [user]);

  const fetchChatRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }

      const data = await response.json();
      setChatRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = async (chat: ChatRoom) => {
    setActiveChat(chat);
    setIsLoadingMessages(true);
    try {
      const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/rooms/${chat.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!chatResponse.ok) {
        throw new Error('Failed to fetch chat room details');
      }
      
      const chatData = await chatResponse.json();
      setActiveChat(chatData);

      const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/rooms/${chat.id}/messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const messagesData = await messagesResponse.json();
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Error fetching chat data:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!activeChat) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/rooms/${activeChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          content: content || null,
          image_url: imageUrl || null,
          type: imageUrl ? 'image' : 'text'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      
      // Update chat room's last message
      setChatRooms(prev => {
        const index = prev.findIndex(chat => chat.id === activeChat.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            last_message: imageUrl ? 'Image' : content,
            last_message_time: new Date().toISOString()
          };
          return updated;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNavbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden border bg-card shadow-sm">
          <div className="w-1/4 border-r bg-card">
            <ChatList 
              chatRooms={chatRooms} 
              activeChat={activeChat} 
              onChatSelect={handleChatSelect}
              onChatCreated={fetchChatRooms}
              isLoading={isLoading}
            />
          </div>
          <div className="flex-1 bg-background">
            {activeChat ? (
              <ChatWindow 
                chat={activeChat} 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isLoading={isLoadingMessages}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold">Welcome to Messages</h3>
                  <p className="text-sm max-w-sm">
                    Select a conversation from the list or start a new one to begin chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}