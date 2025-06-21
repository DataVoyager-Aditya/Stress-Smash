import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

interface BubblePopGameProps {
  onComplete: (score: number) => void;
}

export const BubblePopGame: React.FC<BubblePopGameProps> = ({ onComplete }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const sounds = useSoundEffects();

  const colors = [
    'from-pink-400 to-rose-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-emerald-400',
    'from-purple-400 to-violet-400',
    'from-yellow-400 to-orange-400',
    'from-indigo-400 to-blue-400'
  ];

  // Start calming background music
  useEffect(() => {
    sounds.startBackgroundMusic('calm');
    return () => sounds.stopBackgroundMusic();
  }, [sounds]);

  const createBubble = useCallback((): Bubble => ({
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * (window.innerWidth - 100),
    y: window.innerHeight + 50,
    size: Math.random() * 40 + 30,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: Math.random() * 2 + 1
  }), []);

  // Generate bubbles
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setBubbles(prev => [...prev, createBubble()]);
    }, 800);

    return () => clearInterval(interval);
  }, [gameActive, createBubble]);

  // Move bubbles and remove off-screen ones
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setBubbles(prev => 
        prev
          .map(bubble => ({ ...bubble, y: bubble.y - bubble.speed }))
          .filter(bubble => bubble.y > -100)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [gameActive]);

  // Game timer
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          sounds.stopBackgroundMusic();
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, score, onComplete, sounds]);

  const popBubble = (bubbleId: string) => {
    setBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
    setScore(prev => prev + 10);
    sounds.bubblePop(); // Enhanced bubble pop sound
  };

  const reset = () => {
    setBubbles([]);
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    sounds.startBackgroundMusic('calm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{timeLeft}s</div>
              <div className="text-sm text-gray-600">Time Left</div>
            </div>
            <motion.button
              className="bg-gray-200 text-gray-800 p-3 rounded-full shadow-lg"
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {bubbles.length === 0 && gameActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🫧</div>
            <div className="text-xl font-semibold mb-2">Pop the bubbles!</div>
            <div className="text-lg">Tap or click to burst them and release your stress</div>
          </motion.div>
        </div>
      )}

      {/* Bubbles */}
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className={`absolute cursor-pointer bg-gradient-to-br ${bubble.color} rounded-full shadow-lg`}
            style={{
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ scale: 1.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => popBubble(bubble.id)}
          >
            {/* Bubble highlight */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full" />
            <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Game Over Screen */}
      {!gameActive && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Great Job!</h3>
            <p className="text-gray-600 mb-4">You popped {score / 10} bubbles!</p>
            <p className="text-sm text-gray-500 mb-6">
              Bubble popping helps release tension and provides satisfying sensory feedback
            </p>
            <motion.button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium"
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};