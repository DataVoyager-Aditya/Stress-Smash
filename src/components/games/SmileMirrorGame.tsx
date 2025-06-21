import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, RotateCcw, Heart, Camera } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface SmileMirrorGameProps {
  onComplete: (score: number) => void;
}

interface SmileChallenge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  completed: boolean;
}

export const SmileMirrorGame: React.FC<SmileMirrorGameProps> = ({ onComplete }) => {
  const [currentChallenge, setCurrentChallenge] = useState<SmileChallenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [smileStreak, setSmileStreak] = useState(0);
  const [showMirror, setShowMirror] = useState(true);
  const sounds = useSoundEffects();

  const smileChallenges: SmileChallenge[] = [
    { id: '1', emoji: '😊', name: 'Gentle Smile', description: 'A soft, warm smile', completed: false },
    { id: '2', emoji: '😄', name: 'Big Smile', description: 'Show those teeth!', completed: false },
    { id: '3', emoji: '😁', name: 'Grinning', description: 'Full grin with joy', completed: false },
    { id: '4', emoji: '🥰', name: 'Loving Smile', description: 'Smile with love in your eyes', completed: false },
    { id: '5', emoji: '😌', name: 'Peaceful Smile', description: 'Calm and content', completed: false },
    { id: '6', emoji: '😆', name: 'Laughing Smile', description: 'Like you just heard something funny', completed: false },
    { id: '7', emoji: '🤗', name: 'Welcoming Smile', description: 'Like greeting a friend', completed: false },
    { id: '8', emoji: '😇', name: 'Angelic Smile', description: 'Pure and innocent', completed: false }
  ];

  const positiveAffirmations = [
    "You have a beautiful smile! ✨",
    "Your smile lights up the room! 🌟",
    "Smiling looks great on you! 💫",
    "Your joy is contagious! 😊",
    "You're radiating positivity! 🌈",
    "That smile is your superpower! ⚡",
    "You're absolutely glowing! ✨",
    "Your smile makes the world brighter! ☀️"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-suggest challenges
  useEffect(() => {
    if (!currentChallenge) {
      const availableChallenges = smileChallenges.filter(c => !completedChallenges.includes(c.id));
      if (availableChallenges.length > 0) {
        const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
        setCurrentChallenge(randomChallenge);
      }
    }
  }, [currentChallenge, completedChallenges]);

  const completeChallenge = (challengeId: string) => {
    setCompletedChallenges(prev => [...prev, challengeId]);
    setSmileStreak(prev => prev + 1);
    setCurrentChallenge(null);
    sounds.success();
  };

  const skipChallenge = () => {
    setCurrentChallenge(null);
  };

  const reset = () => {
    setCompletedChallenges([]);
    setCurrentChallenge(null);
    setTimeSpent(0);
    setSmileStreak(0);
  };

  const finishSession = () => {
    const score = Math.min(Math.round((completedChallenges.length * 12) + (smileStreak * 5) + (timeSpent / 60) * 8), 100);
    onComplete(score);
  };

  const getRandomAffirmation = () => {
    return positiveAffirmations[Math.floor(Math.random() * positiveAffirmations.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Smile Mirror</h2>
          <p className="text-gray-600 text-sm sm:text-base">Practice smiling and positive expressions to boost your mood</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{completedChallenges.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Smiles Practiced</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{smileStreak}</div>
              <div className="text-xs sm:text-sm text-gray-600">Smile Streak</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs sm:text-sm text-gray-600">Time Spent</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-pink-600">{Math.round((completedChallenges.length / smileChallenges.length) * 100)}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>

        {/* Mirror Section */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          {/* Mirror Frame */}
          <div className="absolute inset-4 border-8 border-gray-300 rounded-2xl shadow-inner"></div>
          
          <div className="relative z-10 text-center min-h-64 flex flex-col justify-center">
            {showMirror ? (
              <>
                <motion.div
                  className="text-8xl sm:text-9xl mb-4"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🪞
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Look in the Mirror!</h3>
                <p className="text-gray-600 text-sm sm:text-base">Practice your smile and feel the positive energy</p>
              </>
            ) : (
              <>
                <div className="text-6xl sm:text-8xl mb-4">😊</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">You Look Amazing!</h3>
                <p className="text-gray-600 text-sm sm:text-base">{getRandomAffirmation()}</p>
              </>
            )}
          </div>
        </div>

        {/* Current Challenge */}
        <AnimatePresence>
          {currentChallenge && (
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-6 mb-6 text-white"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{currentChallenge.emoji}</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{currentChallenge.name}</h3>
                <p className="text-lg mb-6">{currentChallenge.description}</p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold"
                    onClick={() => completeChallenge(currentChallenge.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    I Did It! 😊
                  </motion.button>
                  
                  <motion.button
                    className="bg-white/20 text-white px-6 py-3 rounded-full font-medium"
                    onClick={skipChallenge}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Skip This One
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smile Gallery */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Smile className="w-5 h-5 mr-2" />
            Smile Collection
          </h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {smileChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl sm:text-3xl ${
                  completedChallenges.includes(challenge.id)
                    ? 'bg-green-100 border-2 border-green-400'
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentChallenge(challenge)}
              >
                {completedChallenges.includes(challenge.id) ? '✅' : challenge.emoji}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mirror Toggle & Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full flex items-center justify-center space-x-2 font-medium"
            onClick={() => setShowMirror(!showMirror)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera className="w-4 h-4" />
            <span>{showMirror ? 'Hide Mirror' : 'Show Mirror'}</span>
          </motion.button>

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
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center space-x-2"
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