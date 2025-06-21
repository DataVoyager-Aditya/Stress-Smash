import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, RotateCcw } from 'lucide-react';

interface GratitudeItem {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface GratitudeTreeGameProps {
  onComplete: (score: number) => void;
}

export const GratitudeTreeGame: React.FC<GratitudeTreeGameProps> = ({ onComplete }) => {
  const [gratitudeItems, setGratitudeItems] = useState<GratitudeItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const leafColors = [
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-400',
    'from-pink-400 to-rose-500',
    'from-purple-400 to-violet-500',
    'from-blue-400 to-cyan-500',
    'from-red-400 to-pink-500'
  ];

  const gratitudePrompts = [
    "Something that made you smile today",
    "A person who supports you",
    "A place that brings you peace",
    "A skill or talent you have",
    "A memory that warms your heart",
    "Something beautiful you noticed",
    "A challenge that helped you grow",
    "A simple pleasure you enjoy"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addGratitudeItem = () => {
    if (newItem.trim()) {
      const item: GratitudeItem = {
        id: Date.now().toString(),
        text: newItem.trim(),
        x: Math.random() * 60 + 20, // 20-80% of container width
        y: Math.random() * 40 + 30, // 30-70% of container height
        color: leafColors[Math.floor(Math.random() * leafColors.length)]
      };
      
      setGratitudeItems(prev => [...prev, item]);
      setNewItem('');
      setShowInput(false);
    }
  };

  const removeItem = (id: string) => {
    setGratitudeItems(prev => prev.filter(item => item.id !== id));
  };

  const reset = () => {
    setGratitudeItems([]);
    setNewItem('');
    setShowInput(false);
  };

  const finishSession = () => {
    const score = Math.min(Math.round((gratitudeItems.length * 10) + (timeSpent / 60) * 5), 100);
    onComplete(score);
  };

  const getRandomPrompt = () => {
    return gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Gratitude Tree</h2>
          <p className="text-gray-600">Grow your tree by adding things you're grateful for</p>
        </div>

        {/* Tree Container */}
        <div className="bg-gradient-to-b from-sky-200 to-green-200 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden min-h-96">
          {/* Tree Trunk */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-32 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-full" />
          
          {/* Tree Branches */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
            <path
              d="M400 500 Q350 400 300 350 Q280 330 260 300"
              stroke="#8B4513"
              strokeWidth="8"
              fill="none"
              className="opacity-80"
            />
            <path
              d="M400 500 Q450 400 500 350 Q520 330 540 300"
              stroke="#8B4513"
              strokeWidth="8"
              fill="none"
              className="opacity-80"
            />
            <path
              d="M400 450 Q380 380 350 320 Q330 300 310 280"
              stroke="#8B4513"
              strokeWidth="6"
              fill="none"
              className="opacity-70"
            />
            <path
              d="M400 450 Q420 380 450 320 Q470 300 490 280"
              stroke="#8B4513"
              strokeWidth="6"
              fill="none"
              className="opacity-70"
            />
          </svg>

          {/* Gratitude Items as Leaves */}
          <AnimatePresence>
            {gratitudeItems.map((item) => (
              <motion.div
                key={item.id}
                className={`absolute bg-gradient-to-br ${item.color} rounded-full p-3 shadow-lg cursor-pointer max-w-xs`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                onClick={() => removeItem(item.id)}
                layout
              >
                <div className="text-white text-sm font-medium text-center">
                  {item.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Button */}
          {!showInput && (
            <motion.button
              className="absolute bottom-8 right-8 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg"
              onClick={() => setShowInput(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Input Modal */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Add to Your Tree</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  💡 {getRandomPrompt()}
                </p>
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="I'm grateful for..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && addGratitudeItem()}
                />
                <div className="flex space-x-3">
                  <motion.button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium"
                    onClick={addGratitudeItem}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Leaf
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                    onClick={() => setShowInput(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{gratitudeItems.length}</div>
              <div className="text-sm text-gray-600">Gratitude Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 font-medium"
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </motion.button>
            
            <motion.button
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-medium flex items-center space-x-2"
              onClick={finishSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-4 h-4" />
              <span>Complete Session</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};