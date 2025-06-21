import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface KindnessCardsGameProps {
  onComplete: (score: number) => void;
}

interface KindnessCard {
  id: string;
  message: string;
  category: string;
  color: string;
  sent: boolean;
  timestamp: Date;
}

export const KindnessCardsGame: React.FC<KindnessCardsGameProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<KindnessCard[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('encouragement');
  const [cardsSent, setCardsSent] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const sounds = useSoundEffects();

  const categories = [
    { id: 'encouragement', name: 'Encouragement', color: 'from-blue-400 to-cyan-400', emoji: '💪' },
    { id: 'gratitude', name: 'Gratitude', color: 'from-green-400 to-emerald-400', emoji: '🙏' },
    { id: 'love', name: 'Love', color: 'from-pink-400 to-rose-400', emoji: '💕' },
    { id: 'support', name: 'Support', color: 'from-purple-400 to-violet-400', emoji: '🤝' },
    { id: 'inspiration', name: 'Inspiration', color: 'from-yellow-400 to-orange-400', emoji: '✨' }
  ];

  const predefinedMessages = {
    encouragement: [
      "You are stronger than you think! 💪",
      "Every step forward is progress, no matter how small 🌟",
      "Believe in yourself - you've got this! 🚀",
      "Your courage inspires others ⭐",
      "You're doing better than you realize 🌈"
    ],
    gratitude: [
      "Thank you for being such a wonderful person 🙏",
      "Your kindness makes the world brighter ☀️",
      "Grateful for your positive energy 🌸",
      "You make a difference just by being you 💫",
      "Thank you for spreading joy wherever you go 🌺"
    ],
    love: [
      "You are loved more than you know 💕",
      "Sending you warm hugs and love 🤗",
      "You deserve all the happiness in the world 💖",
      "Your heart is beautiful 💝",
      "Love and light to you always 🌟"
    ],
    support: [
      "You're not alone - we're here for you 🤝",
      "Take it one day at a time 🌅",
      "It's okay to not be okay sometimes 🫂",
      "You have people who care about you 💙",
      "Sending strength and support your way 🌊"
    ],
    inspiration: [
      "Your dreams are valid and achievable ✨",
      "You have the power to create positive change 🌟",
      "Every day is a new opportunity to shine 🌅",
      "Your potential is limitless 🚀",
      "You inspire others just by being yourself 💫"
    ]
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const createCard = (message?: string) => {
    const category = categories.find(c => c.id === selectedCategory)!;
    const finalMessage = message || predefinedMessages[selectedCategory as keyof typeof predefinedMessages][
      Math.floor(Math.random() * predefinedMessages[selectedCategory as keyof typeof predefinedMessages].length)
    ];

    const newCard: KindnessCard = {
      id: Date.now().toString(),
      message: finalMessage,
      category: category.name,
      color: category.color,
      sent: false,
      timestamp: new Date()
    };

    setCards(prev => [...prev, newCard]);
    setCustomMessage('');
    setShowCreateCard(false);
    sounds.success();
  };

  const sendCard = (cardId: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, sent: true } : card
    ));
    setCardsSent(prev => prev + 1);
    sounds.joy();
  };

  const reset = () => {
    setCards([]);
    setCustomMessage('');
    setCardsSent(0);
    setTimeSpent(0);
    setShowCreateCard(false);
  };

  const finishSession = () => {
    const score = Math.min(Math.round((cardsSent * 20) + (cards.length * 10) + (timeSpent / 60) * 5), 100);
    onComplete(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Kindness Cards</h2>
          <p className="text-gray-600 text-sm sm:text-base">Create and share uplifting messages to spread joy</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{cards.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Cards Created</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-pink-600">{cardsSent}</div>
              <div className="text-xs sm:text-sm text-gray-600">Cards Sent</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs sm:text-sm text-gray-600">Time Spent</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round((cardsSent / Math.max(cards.length, 1)) * 100)}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Kindness Rate</div>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Card Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedCategory === category.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-1">{category.emoji}</div>
                <div className="text-sm font-medium text-gray-800">{category.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Create Card Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create a Custom Message (optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your own kindness message or leave blank for a random one..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
            </div>
            <motion.button
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
              onClick={() => createCard(customMessage.trim() || undefined)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Card</span>
            </motion.button>
          </div>
        </div>

        {/* Cards Display */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Your Kindness Cards
          </h3>
          
          {cards.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💌</div>
              <p>Create your first kindness card to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-white shadow-lg relative overflow-hidden`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    layout
                  >
                    {/* Card decorative elements */}
                    <div className="absolute top-2 right-2 text-white/30 text-2xl">
                      {categories.find(c => c.name === card.category)?.emoji}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="text-sm font-medium mb-2 opacity-90">{card.category}</div>
                      <div className="text-sm mb-4 leading-relaxed">{card.message}</div>
                      
                      {!card.sent ? (
                        <motion.button
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                          onClick={() => sendCard(card.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </motion.button>
                      ) : (
                        <div className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                          <Heart className="w-3 h-3" />
                          <span>Sent ✓</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full flex items-center justify-center space-x-2 font-medium"
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </motion.button>
          
          <motion.button
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center space-x-2"
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
  );
};