import React from 'react';
import { motion } from 'framer-motion';
import { Mood } from '../types';
import { moods } from '../data/moods';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">How are you feeling right now?</h2>
        <p className="text-gray-600">Select the mood that best describes your current state</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            className={`
              p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden
              ${selectedMood?.id === mood.id 
                ? 'border-white shadow-2xl scale-105' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-102'
              }
            `}
            style={{
              background: selectedMood?.id === mood.id 
                ? `linear-gradient(135deg, ${mood.color}20, ${mood.color}10)` 
                : 'white'
            }}
            onClick={() => onMoodSelect(mood)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{mood.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{mood.name}</h3>
              <p className="text-sm text-gray-600">{mood.description}</p>
            </div>
            
            {selectedMood?.id === mood.id && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-10 rounded-2xl`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};