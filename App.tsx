import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TopicList } from './components/TopicList';
import { ChatRoom } from './components/ChatRoom';
import { CreateTopicModal } from './components/CreateTopicModal';
import { subscribeToTopics } from './lib/firebase';
import { Topic } from './types';
import { Loader2, Plus, WifiOff } from 'lucide-react';

function App() {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to topics collection
    try {
      const unsubscribe = subscribeToTopics((data) => {
        setTopics(data);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase connection error:", err);
      setError("Unable to connect to chat service.");
      setIsLoading(false);
    }
  }, []);

  return (
    <Layout>
      <CreateTopicModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {activeTopic ? (
        <ChatRoom 
          topic={activeTopic} 
          onBack={() => setActiveTopic(null)} 
        />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
              <p className="text-gray-500 mt-1">Join a conversation or start your own</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Topic</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-sm font-medium text-gray-500">Loading topics...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-100">
              <WifiOff className="w-10 h-10 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <TopicList 
              topics={topics} 
              onSelectTopic={setActiveTopic} 
            />
          )}
        </div>
      )}
    </Layout>
  );
}

export default App;
