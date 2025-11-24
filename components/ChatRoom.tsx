import React, { useState, useEffect, useRef } from 'react';
import { Topic, Message } from '../types';
import { subscribeToMessages, sendMessage, closeTopic } from '../lib/firebase';
import { generateGuestId, formatDate, cn } from '../lib/utils';
import { ArrowLeft, Send, Hash, Loader2 } from 'lucide-react';

interface ChatRoomProps {
  topic: Topic;
  onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ topic, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const guestId = generateGuestId();

  useEffect(() => {
    const unsubscribe = subscribeToMessages(topic.id, (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [topic.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(topic.id, newMessage, guestId);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-white z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-gray-900">{topic.title}</h2>
            {topic.closed && (
              <span className="ml-2 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Closed</span>
            )}
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{topic.description}</p>
          <div className="text-xs text-gray-400 mt-1">
            <span className="font-medium text-gray-700">Dibuat oleh</span>
            <span className="ml-2">{topic.ownerName || topic.ownerId || 'Anonim'}</span>
          </div>
        </div>
        <div className="ml-auto">
          {!topic.closed && topic.ownerId === guestId && (
            <button
              onClick={async () => {
                if (!confirm('Tutup topik ini? Ini akan mencegah pesan baru.')) return;
                setIsClosing(true);
                try {
                  await closeTopic(topic.id, guestId);
                  // navigate back to list so user sees updated state
                  onBack();
                } catch (err) {
                  console.error('Gagal menutup topik', err);
                  alert('Gagal menutup topik.');
                } finally {
                  setIsClosing(false);
                }
              }}
              disabled={isClosing}
              className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-md text-sm hover:bg-red-100 disabled:opacity-50"
            >
              {isClosing ? 'Menutup...' : 'Tutup Topik'}
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
            <MessageSquarePlaceholder />
            <p className="mt-2 text-sm">Belum ada pesan. Sapa sekarang!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === guestId;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] font-bold text-gray-400">
                    {isMe ? 'You' : msg.senderId}
                  </span>
                </div>
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words",
                    isMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatDate(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="flex items-center gap-2 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Pesan #${topic.title}...`}
            className="flex-1 pl-4 pr-12 py-3 bg-gray-100 border-0 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            disabled={isSending || !!topic.closed}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || !!topic.closed}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const MessageSquarePlaceholder = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
