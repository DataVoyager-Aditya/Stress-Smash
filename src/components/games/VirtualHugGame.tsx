import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, RotateCcw, Send } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface VirtualHugGameProps {
  onComplete: (score: number) => void;
}

interface Hug {
  id: string;
  message: string;
  sender: string;
  timestamp: Date;
  type: 'sent' | 'received';
}

export const VirtualHugGame: React.FC<VirtualHugGameProps> = ({ onComplete }) => {
  const [hugs, setHugs] = useState<Hug[]>([]);
  const [hugMessage, setHugMessage] = useState('');
  const [hugsSent, setHugsSent] = useState(0);
  const [hugsReceived, setHugsReceived] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHugAnimation, setShowHugAnimation] = useState(false);
  const sounds = useSoundEffects();

  const hugMessages = [
    "Sending you a warm, comforting hug 🤗",
    "You're not alone. Here's a virtual hug! 💕",
    "Wrapping you in love and support 🌟",
    "A gentle hug to brighten your day ☀️",
    "Sending positive energy your way! ✨",
    "You're stronger than you know 💪",
    "Here's a hug filled with hope 🌈",
    "Thinking of you with care 💝"
  ];

  const receivedHugMessages = [
    "Thank you for being amazing! 🤗",
    "Your kindness means everything 💕",
    "Sending love right back to you! 🌟",
    "You made my day brighter ☀️",
    "Grateful for your support ✨",
    "You're a wonderful person 💪",
    "Your hug was just what I needed 🌈",
    "Feeling blessed by your kindness 💝"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate receiving hugs
  useEffect(() => {
    const receiveHugTimer = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 5 seconds
        const message = receivedHugMessages[Math.floor(Math.random() * receivedHugMessages.length)];
        const newHug: Hug = {
          id: Date.now().toString(),
          message,
          sender: 'Community Member',
          timestamp: new Date(),
          type: 'received'
        };
        
        setHugs(prev => [...prev, newHug]);
        setHugsReceived(prev => prev + 1);
        sounds.notification();
      }
    }, 5000);

    return () => clearInterval(receiveHugTimer);
  }, [sounds]);

  const sendHug = () => {
    const message = hugMessage.trim() || hugMessages[Math.floor(Math.random() * hugMessages.length)];
    
    const newHug: Hug = {
      id: Date.now().toString(),
      message,
      sender: 'You',
      timestamp: new Date(),
      type: 'sent'
    };
    
    setHugs(prev => [...prev, newHug]);
    setHugsSent(prev => prev + 1);
    setHugMessage('');
    setShowHugAnimation(true);
    sounds.success();
    
    setTimeout(() => setShowHugAnimation(false), 2000);
  };

  const reset = () => {
    setHugs([]);
    setHugsSent(0);
    setHugsReceived(0);
    setTimeSpent(0);
    setHugMessage('');
  };

  const finishSession = () => {
    const score = Math.min(Math.round((hugsSent * 15) + (hugsReceived * 10) + (timeSpent / 60) * 5), 100);
    onComplete(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-red-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Virtual Hugs</h2>
          <p className="text-gray-600 text-sm sm:text-base">Send and receive comforting virtual hugs</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-pink-600">{hugsSent}</div>
              <div className="text-xs sm:text-sm text-gray-600">Hugs Sent</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-rose-600">{hugsReceived}</div>
              <div className="text-xs sm:text-sm text-gray-600">Hugs Received</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs sm:text-sm text-gray-600">Time Spent</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{hugsSent + hugsReceived}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Hugs</div>
            </div>
          </div>
        </div>

        {/* Hug Animation */}
        <AnimatePresence>
          {showHugAnimation && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-8xl"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2 }}
              >
                🤗
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hug Feed */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Hug Feed
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {hugs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🤗</div>
                <p>Send your first hug to get started!</p>
              </div>
            ) : (
              hugs.map((hug) => (
                <motion.div
                  key={hug.id}
                  className={`p-3 rounded-lg ${
                    hug.type === 'sent' 
                      ? 'bg-pink-100 ml-4 sm:ml-8' 
                      : 'bg-blue-100 mr-4 sm:mr-8'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start space-x-2">
                    <div className="text-2xl">
                      {hug.type === 'sent' ? '🤗' : '💕'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{hug.sender}</div>
                      <div className="text-gray-600 text-sm">{hug.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {hug.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Send Hug */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Send a Hug
          </h3>
          
          <div className="space-y-4">
            <textarea
              value={hugMessage}
              onChange={(e) => setHugMessage(e.target.value)}
              placeholder="Write a personal message or leave blank for a random one..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              rows={3}
            />
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-600">Quick messages:</span>
              {hugMessages.slice(0, 3).map((message, index) => (
                <button
                  key={index}
                  onClick={() => setHugMessage(message)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                >
                  {message.split(' ').slice(0, 3).join(' ')}...
                </button>
              ))}
            </div>
            
            <motion.button
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              onClick={sendHug}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="w-4 h-4" />
              <span>Send Hug</span>
            </motion.button>
          </div>
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
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center space-x-2"
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