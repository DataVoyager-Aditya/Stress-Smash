import { Mood } from '../types';

export const moods: Mood[] = [
  {
    id: 'anxious',
    name: 'Anxious',
    color: '#ef4444',
    gradient: 'from-red-500 to-orange-500',
    icon: '😰',
    intensity: 8,
    description: 'Feeling overwhelmed or worried'
  },
  {
    id: 'stressed',
    name: 'Stressed',
    color: '#f97316',
    gradient: 'from-orange-500 to-yellow-500',
    icon: '😤',
    intensity: 7,
    description: 'Under pressure or tension'
  },
  {
    id: 'frustrated',
    name: 'Frustrated',
    color: '#dc2626',
    gradient: 'from-red-600 to-pink-500',
    icon: '😠',
    intensity: 6,
    description: 'Annoyed or blocked by obstacles'
  },
  {
    id: 'sad',
    name: 'Sad',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-500',
    icon: '😢',
    intensity: 5,
    description: 'Feeling down or melancholy'
  },
  {
    id: 'tired',
    name: 'Tired',
    color: '#6b7280',
    gradient: 'from-gray-500 to-slate-500',
    icon: '😴',
    intensity: 4,
    description: 'Lacking energy or motivation'
  },
  {
    id: 'neutral',
    name: 'Neutral',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    icon: '😐',
    intensity: 3,
    description: 'Feeling balanced and calm'
  },
  {
    id: 'content',
    name: 'Content',
    color: '#059669',
    gradient: 'from-emerald-600 to-green-500',
    icon: '😌',
    intensity: 2,
    description: 'Peaceful and satisfied'
  },
  {
    id: 'happy',
    name: 'Happy',
    color: '#eab308',
    gradient: 'from-yellow-500 to-amber-400',
    icon: '😊',
    intensity: 1,
    description: 'Feeling joyful and positive'
  }
];