import React from 'react';
import { Topic } from '../types';
import { Hash, ChevronRight, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopicListProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
}

export const TopicList: React.FC<TopicListProps> = ({ topics, onSelectTopic }) => {
  if (topics.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
        <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No topics yet</h3>
        <p className="text-gray-500">Be the first to start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelectTopic(topic)}
          className={cn(
            "group relative flex flex-col items-start p-6 bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-200",
            "hover:shadow-md hover:border-indigo-200 hover:-translate-y-1"
          )}
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Hash className="w-6 h-6" />
            </div>
            <div className={cn(
              "flex items-center text-xs font-medium px-2 py-1 rounded-full",
              topic.closed ? "text-gray-500 bg-gray-50" : "text-gray-400 bg-gray-50"
            )}>
              <MessageCircle className="w-3 h-3 mr-1" />
              <span>{topic.closed ? 'Closed' : 'Active'}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 text-left w-full group-hover:text-indigo-600 transition-colors">
            {topic.title}
          </h3>
          
          <p className="text-sm text-gray-500 line-clamp-2 text-left w-full mb-2 h-10">
            {topic.description || "No description provided."}
          </p>

          <div className="text-xs text-gray-400 w-full mb-4">
            <span className="font-medium text-gray-700">Created by</span>
            <span className="ml-2">{topic.ownerName || topic.ownerId || 'Anonymous'}</span>
          </div>

          <div className="mt-auto w-full flex items-center text-sm font-medium text-indigo-600 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            Join Discussion <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </button>
      ))}
    </div>
  );
};
