import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface EnergyBounceGameProps {
  onComplete: (score: number) => void;
}

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  energy: number;
}

export const EnergyBounceGame: React.FC<EnergyBounceGameProps> = ({ onComplete }) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [bounces, setBounces] = useState(0);
  const sounds = useSoundEffects();

  const colors = [
    'from-red-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-purple-400 to-violet-500',
    'from-indigo-400 to-blue-500'
  ];

  const createBall = useCallback((): Ball => ({
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * (window.innerWidth - 100) + 50,
    y: Math.random() * 200 + 100,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 30 + 40,
    energy: Math.floor(Math.random() * 20) + 10
  }), []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Add balls periodically
  useEffect(() => {
    if (isPlaying) {
      const ballInterval = setInterval(() => {
        setBalls(prev => {
          if (prev.length < 8) {
            return [...prev, createBall()];
          }
          return prev;
        });
      }, 2000);

      return () => clearInterval(ballInterval);
    }
  }, [isPlaying, createBall]);

  // Animate balls
  useEffect(() => {
    if (!isPlaying) return;

    const animationInterval = setInterval(() => {
      setBalls(prev => prev.map(ball => {
        let newX = ball.x + ball.vx;
        let newY = ball.y + ball.vy;
        let newVx = ball.vx;
        let newVy = ball.vy + 0.5; // gravity

        // Bounce off walls
        if (newX <= ball.size/2 || newX >= window.innerWidth - ball.size/2) {
          newVx = -newVx * 0.8;
          newX = Math.max(ball.size/2, Math.min(window.innerWidth - ball.size/2, newX));
        }

        // Bounce off floor
        if (newY >= window.innerHeight - ball.size/2 - 100) {
          newVy = -Math.abs(newVy) * 0.8;
          newY = window.innerHeight - ball.size/2 - 100;
        }

        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        };
      }));
    }, 16);

    return () => clearInterval(animationInterval);
  }, [isPlaying]);

  const bounceBall = (ballId: string) => {
    setBalls(prev => prev.map(ball => {
      if (ball.id === ballId) {
        setBounces(b => b + 1);
        setScore(s => s + ball.energy);
        setEnergy(e => Math.min(100, e + ball.energy));
        sounds.tap();
        
        return {
          ...ball,
          vy: -Math.abs(ball.vy) - 5,
          vx: ball.vx + (Math.random() - 0.5) * 4
        };
      }
      return ball;
    }));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      sounds.success();
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setBalls([]);
    setScore(0);
    setEnergy(0);
    setTimeSpent(0);
    setBounces(0);
  };

  const finishSession = () => {
    const finalScore = Math.min(Math.round((score / 10) + (bounces * 2) + (timeSpent / 60) * 5), 100);
    onComplete(finalScore);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{score}</div>
              <div className="text-xs sm:text-sm text-gray-600">Energy Score</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-red-600">{bounces}</div>
              <div className="text-xs sm:text-sm text-gray-600">Bounces</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-800">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs sm:text-sm text-gray-600">Time</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{energy}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Energy Level</div>
            </div>
          </div>
          
          {/* Energy Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${energy}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!isPlaying && balls.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">⚡</div>
            <div className="text-xl sm:text-2xl font-semibold mb-2">Energy Bounce!</div>
            <div className="text-base sm:text-lg">Tap bouncing balls to boost your energy</div>
            <div className="text-sm text-gray-500 mt-2">Press play to start the energizing beats</div>
          </motion.div>
        </div>
      )}

      {/* Bouncing Balls */}
      <AnimatePresence>
        {balls.map((ball) => (
          <motion.div
            key={ball.id}
            className={`absolute cursor-pointer bg-gradient-to-br ${ball.color} rounded-full shadow-lg flex items-center justify-center text-white font-bold select-none`}
            style={{
              left: ball.x - ball.size / 2,
              top: ball.y - ball.size / 2,
              width: ball.size,
              height: ball.size,
            }}
            onClick={() => bounceBall(ball.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <span className="text-sm">+{ball.energy}</span>
            
            {/* Energy glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  `0 0 0px rgba(255, 255, 255, 0.5)`,
                  `0 0 20px rgba(255, 255, 255, 0.8)`,
                  `0 0 0px rgba(255, 255, 255, 0.5)`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Beat Visualization */}
      {isPlaying && (
        <div className="absolute bottom-20 left-0 right-0">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full"
                animate={{
                  height: [10, 40, 10],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
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
              <span>{isPlaying ? 'Pause' : 'Start Energy Boost'}</span>
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
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center space-x-2"
              onClick={finishSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-4 h-4" />
              <span>Complete</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};