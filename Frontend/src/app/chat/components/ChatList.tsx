import { ChatRoom } from '../types';
import { useAuthContext } from '@/components/providers/auth-provider';
import CreateChatRoom from './CreateChatRoom';
import { UserCircle, Users } from 'lucide-react';

interface ChatListProps {
  chatRooms: ChatRoom[];
  activeChat: ChatRoom | null;
  onChatSelect: (chat: ChatRoom) => void;
  onChatCreated: () => void;
  isLoading?: boolean;
}

export default function ChatList({ chatRooms = [], activeChat, onChatSelect, onChatCreated, isLoading = false }: ChatListProps) {
  const { user } = useAuthContext();

  const getChatName = (chat: ChatRoom) => {
    if (chat.is_group) {
      return chat.name;
    }
    const otherParticipant = chat.participants?.find(p => p.id !== user?.id);
    if (otherParticipant) {
      return `${otherParticipant.first_name} ${otherParticipant.last_name}`;
    }
    return chat.name || 'Unknown User';
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

  const safeChatRooms = Array.isArray(chatRooms) ? chatRooms : [];

  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">Connect with your community</p>
      </div>
      
      {/* <div className="p-4">
        <CreateChatRoom onChatCreated={onChatCreated} />
      </div> */}

      <div className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : safeChatRooms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <Users className="w-12 h-12 text-gray-400" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm text-center max-w-sm">
              Start a new conversation by clicking the button above
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeChatRooms.map((chat) => {
              const chatName = getChatName(chat);
              const otherParticipant = chat.participants?.find(p => p.id !== user?.id);
              const initials = getInitials(chatName);
              const avatarColor = getAvatarColor(chat.id);

              return (
                <div
                  key={chat.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChat?.id === chat.id 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => onChatSelect(chat)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold`}>
                      {chat.is_group ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chatName}
                        </h3>
                        {chat.last_message_time && (
                          <span className="text-xs text-gray-500">
                            {new Date(chat.last_message_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      {chat.last_message && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {chat.last_message}
                        </p>
                      )}
                      {!chat.last_message && (
                        <p className="text-sm text-gray-400 italic mt-1">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}