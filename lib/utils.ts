import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateGuestId = (): string => {
  const existing = localStorage.getItem('anon_guest_id');
  if (existing) return existing;
  
  const newId = `guest_${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  localStorage.setItem('anon_guest_id', newId);
  return newId;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
