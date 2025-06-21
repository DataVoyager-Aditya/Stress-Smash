import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Star } from 'lucide-react';

interface Firework {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  particles: Particle[];
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

interface JoyBurstGameProps {
  onComplete: (score: number) => void;
}

export const JoyBurstGame: React.FC<JoyBurstGameProps> = ({ onComplete }) => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [autoMode, setAutoMode] = useState(false);

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
    '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoMode) {
      const interval = setInterval(() => {
        createFirework(
          Math.random() * window.innerWidth,
          Math.random() * (window.innerHeight * 0.7) + 100
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoMode]);

  const createFirework = (x: number, y: number) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const particleCount = 12 + Math.floor(Math.random() * 8);
    
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      
      particles.push({
        id: `particle-${i}`,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: color,
        life: 1
      });
    }

    const firework: Firework = {
      id: Date.now().toString() + Math.random(),
      x,
      y,
      color,
      size: 20 + Math.random() * 30,
      particles
    };

    setFireworks(prev => [...prev, firework]);
    setScore(prev => prev + 10);

    // Remove firework after animation
    setTimeout(() => {
      setFireworks(prev => prev.filter(fw => fw.id !== firework.id));
    }, 2000);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    createFirework(x, y);
  };

  const reset = () => {
    setFireworks([]);
    setScore(0);
    setTimeSpent(0);
    setAutoMode(false);
  };

  const finishSession = () => {
    const finalScore = Math.min(Math.round((score / 10) + (timeSpent / 60) * 10), 100);
    onComplete(finalScore);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex justify-between items-center text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-sm opacity-80">Joy Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm opacity-80">Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{fireworks.length}</div>
              <div className="text-sm opacity-80">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div 
        className="min-h-screen cursor-pointer relative"
        onClick={handleClick}
      >
        {/* Instructions */}
        {fireworks.length === 0 && !autoMode && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">🎆</div>
              <div className="text-2xl font-semibold mb-2">Create Joy Bursts!</div>
              <div className="text-lg opacity-80">Click anywhere to create colorful fireworks</div>
              <div className="text-sm opacity-60 mt-2">Let your happiness explode across the sky</div>
            </motion.div>
          </div>
        )}

        {/* Fireworks */}
        <AnimatePresence>
          {fireworks.map((firework) => (
            <div key={firework.id}>
              {/* Central burst */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: firework.x - firework.size / 2,
                  top: firework.y - firework.size / 2,
                  width: firework.size,
                  height: firework.size,
                  backgroundColor: firework.color,
                  boxShadow: `0 0 ${firework.size}px ${firework.color}`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.8 }}
              />

              {/* Particles */}
              {firework.particles.map((particle, index) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: particle.color,
                    boxShadow: `0 0 6px ${particle.color}`,
                  }}
                  initial={{
                    x: firework.x,
                    y: firework.y,
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{
                    x: firework.x + particle.vx * 50,
                    y: firework.y + particle.vy * 50,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          ))}
        </AnimatePresence>

        {/* Floating sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-300 text-xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <motion.button
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  autoMode 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setAutoMode(!autoMode)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Auto Mode
              </motion.button>

              <motion.button
                className="bg-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-all"
                onClick={reset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                Reset
              </motion.button>
            </div>

            <motion.button
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium"
              onClick={finishSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="w-4 h-4 mr-2 inline" />
              Complete
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};