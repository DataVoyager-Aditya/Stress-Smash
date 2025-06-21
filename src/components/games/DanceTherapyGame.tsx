import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Music, Zap } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface DanceTherapyGameProps {
  onComplete: (score: number) => void;
}

interface DanceMove {
  id: string;
  name: string;
  emoji: string;
  description: string;
  energy: number;
}

export const DanceTherapyGame: React.FC<DanceTherapyGameProps> = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMove, setCurrentMove] = useState<DanceMove | null>(null);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [energy, setEnergy] = useState(50);
  const [movesCompleted, setMovesCompleted] = useState(0);
  const [showMovePrompt, setShowMovePrompt] = useState(false);
  const sounds = useSoundEffects();

  const danceMoves: DanceMove[] = [
    { id: '1', name: 'Arm Waves', emoji: '🌊', description: 'Gentle flowing arm movements', energy: 10 },
    { id: '2', name: 'Hip Sway', emoji: '💃', description: 'Sway your hips side to side', energy: 15 },
    { id: '3', name: 'Shoulder Roll', emoji: '🔄', description: 'Roll your shoulders back and forth', energy: 8 },
    { id: '4', name: 'Step Touch', emoji: '👣', description: 'Step side to side with rhythm', energy: 20 },
    { id: '5', name: 'Jazz Hands', emoji: '✨', description: 'Sparkle with your fingers', energy: 12 },
    { id: '6', name: 'Body Wave', emoji: '🌀', description: 'Wave motion through your body', energy: 25 },
    { id: '7', name: 'Twist', emoji: '🌪️', description: 'Twist your torso left and right', energy: 18 },
    { id: '8', name: 'Jump', emoji: '⬆️', description: 'Light bouncing movements', energy: 30 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Auto-suggest moves
  useEffect(() => {
    if (isPlaying) {
      const moveInterval = setInterval(() => {
        const randomMove = danceMoves[Math.floor(Math.random() * danceMoves.length)];
        setCurrentMove(randomMove);
        setShowMovePrompt(true);
        sounds.notification();
        
        setTimeout(() => {
          setShowMovePrompt(false);
        }, 5000);
      }, 8000);

      return () => clearInterval(moveInterval);
    }
  }, [isPlaying, sounds]);

  const performMove = (move: DanceMove) => {
    setScore(prev => prev + move.energy);
    setEnergy(prev => Math.min(100, prev + move.energy));
    setMovesCompleted(prev => prev + 1);
    setShowMovePrompt(false);
    sounds.joy();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      sounds.success();
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentMove(null);
    setScore(0);
    setTimeSpent(0);
    setEnergy(50);
    setMovesCompleted(0);
    setShowMovePrompt(false);
  };

  const finishSession = () => {
    const finalScore = Math.min(Math.round((score / 5) + (timeSpent / 60) * 10), 100);
    onComplete(finalScore);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Dance Therapy</h2>
          <p className="text-gray-600 text-sm sm:text-base">Move your body to uplifting rhythms and boost your mood</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{score}</div>
              <div className="text-xs sm:text-sm text-gray-600">Energy Points</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-pink-600">{movesCompleted}</div>
              <div className="text-xs sm:text-sm text-gray-600">Moves Done</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs sm:text-sm text-gray-600">Time Dancing</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{energy}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Energy Level</div>
            </div>
          </div>
          
          {/* Energy Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                initial={{ width: '50%' }}
                animate={{ width: `${energy}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Current Move Prompt */}
        <AnimatePresence>
          {showMovePrompt && currentMove && (
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 mb-6 text-white text-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="text-6xl mb-4">{currentMove.emoji}</div>
              <h3 className="text-2xl font-bold mb-2">{currentMove.name}</h3>
              <p className="text-lg mb-4">{currentMove.description}</p>
              <motion.button
                className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold text-lg"
                onClick={() => performMove(currentMove)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Do This Move! (+{currentMove.energy} energy)
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dance Floor */}
        <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 relative overflow-hidden min-h-64">
          {/* Disco Ball Effect */}
          {isPlaying && (
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0.5, 1.5, 0.5],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Dance Instructions */}
          {!isPlaying ? (
            <div className="text-center">
              <div className="text-6xl mb-4">💃</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Dance?</h3>
              <p className="text-gray-600 mb-4">Press play and follow the move prompts to boost your energy!</p>
            </div>
          ) : (
            <div className="text-center">
              <motion.div
                className="text-8xl mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎵
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Keep Moving!</h3>
              <p className="text-gray-600">Let the music guide your movements</p>
            </div>
          )}
        </div>

        {/* Move Library */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Music className="w-5 h-5 mr-2" />
            Dance Moves
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {danceMoves.map((move) => (
              <motion.button
                key={move.id}
                className="p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-center transition-colors"
                onClick={() => performMove(move)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!isPlaying}
              >
                <div className="text-2xl mb-1">{move.emoji}</div>
                <div className="text-sm font-medium text-gray-800">{move.name}</div>
                <div className="text-xs text-gray-600">+{move.energy}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            className={`px-6 py-3 rounded-full font-medium flex items-center justify-center space-x-2 ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Start Dancing'}</span>
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
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center space-x-2"
            onClick={finishSession}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-4 h-4" />
            <span>Complete Session</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};