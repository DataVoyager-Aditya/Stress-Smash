import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, RotateCcw, Sparkles } from 'lucide-react';

interface WordConnection {
  id: string;
  word: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

interface WordFlowGameProps {
  onComplete: (score: number) => void;
}

export const WordFlowGame: React.FC<WordFlowGameProps> = ({ onComplete }) => {
  const [words, setWords] = useState<WordConnection[]>([]);
  const [newWord, setNewWord] = useState('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [positiveScore, setPositiveScore] = useState(0);

  const positiveWords = [
    'love', 'joy', 'peace', 'hope', 'calm', 'happy', 'grateful', 'strong',
    'brave', 'kind', 'gentle', 'wise', 'bright', 'warm', 'safe', 'free',
    'beautiful', 'amazing', 'wonderful', 'blessed', 'confident', 'creative',
    'inspired', 'motivated', 'relaxed', 'centered', 'balanced', 'serene'
  ];

  const wordColors = [
    'from-pink-400 to-rose-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-purple-400 to-violet-500',
    'from-yellow-400 to-orange-400',
    'from-indigo-400 to-blue-500'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize with some positive words
  useEffect(() => {
    const initialWords = ['peace', 'joy', 'calm'].map((word, index) => ({
      id: `initial-${index}`,
      word,
      x: 30 + index * 25,
      y: 40 + index * 15,
      color: wordColors[index],
      connections: []
    }));
    setWords(initialWords);
  }, []);

  const addWord = () => {
    if (newWord.trim()) {
      const isPositive = positiveWords.includes(newWord.toLowerCase().trim());
      
      const wordConnection: WordConnection = {
        id: Date.now().toString(),
        word: newWord.trim(),
        x: Math.random() * 70 + 15, // 15-85% of container width
        y: Math.random() * 60 + 20, // 20-80% of container height
        color: wordColors[Math.floor(Math.random() * wordColors.length)],
        connections: []
      };
      
      setWords(prev => [...prev, wordConnection]);
      
      if (isPositive) {
        setPositiveScore(prev => prev + 10);
      }
      
      setNewWord('');
    }
  };

  const connectWords = (wordId: string) => {
    if (selectedWord && selectedWord !== wordId) {
      setWords(prev => prev.map(word => {
        if (word.id === selectedWord) {
          return {
            ...word,
            connections: [...word.connections, wordId]
          };
        }
        if (word.id === wordId) {
          return {
            ...word,
            connections: [...word.connections, selectedWord]
          };
        }
        return word;
      }));
      setSelectedWord(null);
      setPositiveScore(prev => prev + 5);
    } else {
      setSelectedWord(wordId);
    }
  };

  const removeWord = (wordId: string) => {
    setWords(prev => prev.filter(word => word.id !== wordId));
    if (selectedWord === wordId) {
      setSelectedWord(null);
    }
  };

  const reset = () => {
    setWords([]);
    setNewWord('');
    setSelectedWord(null);
    setPositiveScore(0);
    setTimeSpent(0);
  };

  const finishSession = () => {
    const score = Math.min(Math.round(positiveScore + (words.length * 3) + (timeSpent / 60) * 5), 100);
    onComplete(score);
  };

  const getRandomSuggestion = () => {
    const unused = positiveWords.filter(word => 
      !words.some(w => w.word.toLowerCase() === word.toLowerCase())
    );
    return unused[Math.floor(Math.random() * unused.length)] || 'beautiful';
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    words.forEach(word => {
      word.connections.forEach(connectionId => {
        const connectedWord = words.find(w => w.id === connectionId);
        if (connectedWord) {
          connections.push(
            <svg
              key={`${word.id}-${connectionId}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <line
                x1={`${word.x}%`}
                y1={`${word.y}%`}
                x2={`${connectedWord.x}%`}
                y2={`${connectedWord.y}%`}
                stroke="rgba(139, 69, 19, 0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          );
        }
      });
    });
    
    return connections;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Positive Word Flow</h2>
          <p className="text-gray-600">Connect positive words to shift your mindset and create meaning</p>
        </div>

        {/* Word Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder={`Try "${getRandomSuggestion()}" or add your own positive word...`}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && addWord()}
            />
            <motion.button
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
              onClick={addWord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Word</span>
            </motion.button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Suggestions:</span>
            {positiveWords.slice(0, 8).map(word => (
              <button
                key={word}
                onClick={() => setNewWord(word)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Word Flow Canvas */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden min-h-96">
          {/* Render connections first (behind words) */}
          {renderConnections()}
          
          {/* Words */}
          <AnimatePresence>
            {words.map((word) => (
              <motion.div
                key={word.id}
                className={`absolute bg-gradient-to-br ${word.color} rounded-full px-4 py-2 shadow-lg cursor-pointer select-none ${
                  selectedWord === word.id ? 'ring-4 ring-yellow-400' : ''
                }`}
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  zIndex: 2
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, y: -5 }}
                onClick={() => connectWords(word.id)}
                onDoubleClick={() => removeWord(word.id)}
              >
                <div className="text-white font-medium text-center whitespace-nowrap">
                  {word.word}
                </div>
                
                {/* Connection indicator */}
                {word.connections.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">{word.connections.length}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {words.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-center text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-6xl mb-4">💭</div>
                <div className="text-xl font-semibold mb-2">Create Your Positive Word Flow</div>
                <div className="text-lg">Add positive words and connect them to create meaning</div>
                <div className="text-sm mt-2 text-gray-500">Click to connect • Double-click to remove</div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Stats and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Session Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Positive Score:</span>
                <span className="font-bold text-purple-600">{positiveScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Words Added:</span>
                <span className="font-bold">{words.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Connections:</span>
                <span className="font-bold">{words.reduce((sum, word) => sum + word.connections.length, 0) / 2}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time Spent:</span>
                <span className="font-bold">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Controls</h3>
            <div className="space-y-3">
              <motion.button
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear All Words</span>
              </motion.button>
              
              <motion.button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                onClick={finishSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-4 h-4" />
                <span>Complete Session</span>
              </motion.button>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">💡 <strong>Tips:</strong></p>
              <ul className="space-y-1 text-xs">
                <li>• Use positive, uplifting words</li>
                <li>• Connect related words together</li>
                <li>• Focus on words that resonate with you</li>
                <li>• Let the connections create new meanings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};