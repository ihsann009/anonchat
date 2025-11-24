import React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { createTopic } from '../lib/firebase';
import { generateGuestId } from '../lib/utils';
import { useState } from 'react';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creatorName, setCreatorName] = useState(() => {
    try {
      return localStorage.getItem('anon_guest_name') || '';
    } catch (e) {
      return '';
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const ownerId = generateGuestId();
      const ownerName = creatorName?.trim() || ownerId;
      // persist name locally for future topics
      try { if (creatorName?.trim()) localStorage.setItem('anon_guest_name', creatorName.trim()); } catch {}
      await createTopic(title, description, ownerId, ownerName);
      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error("Failed to create topic", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Topik Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Topik</label>
            <input
              type="text"
              required
              maxLength={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan Topik"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
            <textarea
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan Deskripsi..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anda (opsional)</label>
            <input
              type="text"
              maxLength={30}
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Isi nama Anda (opsional)"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Buat Topik
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
