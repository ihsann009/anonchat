import React from 'react';
import { MessageSquare, UserCircle2 } from 'lucide-react';
import { generateGuestId } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const guestId = generateGuestId();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AnonChat</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <UserCircle2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">{guestId}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>
      
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
          <p>Anonymous Chat • Messages are public • Be nice</p>
        </div>
      </footer>
    </div>
  );
};
