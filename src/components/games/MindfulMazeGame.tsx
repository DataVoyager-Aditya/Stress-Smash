import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Target, Heart } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface MindfulMazeGameProps {
  onComplete: (score: number) => void;
}

interface Position {
  x: number;
  y: number;
}

export const MindfulMazeGame: React.FC<MindfulMazeGameProps> = ({ onComplete }) => {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [timeSpent, setTimeSpent] = useState(0);
  const [moves, setMoves] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const sounds = useSoundEffects();

  // Simple maze layout (1 = wall, 0 = path, 2 = goal)
  const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isComplete) return;
      
      let newPos = { ...playerPos };
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newPos.y = Math.max(0, playerPos.y - 1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newPos.y = Math.min(maze.length - 1, playerPos.y + 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newPos.x = Math.max(0, playerPos.x - 1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newPos.x = Math.min(maze[0].length - 1, playerPos.x + 1);
          break;
        default:
          return;
      }

      // Check if move is valid (not into a wall)
      if (maze[newPos.y][newPos.x] !== 1) {
        setPlayerPos(newPos);
        setMoves(prev => prev + 1);
        sounds.tap();
        
        // Check if reached goal
        if (maze[newPos.y][newPos.x] === 2) {
          setIsComplete(true);
          sounds.success();
          setTimeout(() => {
            const score = Math.max(20, 100 - moves - Math.floor(timeSpent / 10));
            onComplete(score);
          }, 1000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, isComplete, moves, timeSpent, sounds, onComplete]);

  const reset = () => {
    setPlayerPos({ x: 1, y: 1 });
    setTimeSpent(0);
    setMoves(0);
    setIsComplete(false);
  };

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (isComplete) return;
    
    let newPos = { ...playerPos };
    
    switch (direction) {
      case 'up':
        newPos.y = Math.max(0, playerPos.y - 1);
        break;
      case 'down':
        newPos.y = Math.min(maze.length - 1, playerPos.y + 1);
        break;
      case 'left':
        newPos.x = Math.max(0, playerPos.x - 1);
        break;
      case 'right':
        newPos.x = Math.min(maze[0].length - 1, playerPos.x + 1);
        break;
    }

    if (maze[newPos.y][newPos.x] !== 1) {
      setPlayerPos(newPos);
      setMoves(prev => prev + 1);
      sounds.tap();
      
      if (maze[newPos.y][newPos.x] === 2) {
        setIsComplete(true);
        sounds.success();
        setTimeout(() => {
          const score = Math.max(20, 100 - moves - Math.floor(timeSpent / 10));
          onComplete(score);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Mindful Maze</h2>
          <p className="text-gray-600 text-sm sm:text-base">Navigate with focused attention and mindfulness</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{moves}</div>
              <div className="text-xs sm:text-sm text-gray-600">Moves</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">{timeSpent}s</div>
              <div className="text-xs sm:text-sm text-gray-600">Time</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">Level {currentLevel}</div>
              <div className="text-xs sm:text-sm text-gray-600">Current</div>
            </div>
          </div>
        </div>

        {/* Maze */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`
                    aspect-square rounded-sm relative
                    ${cell === 1 ? 'bg-gray-800' : cell === 2 ? 'bg-emerald-400' : 'bg-gray-100'}
                  `}
                >
                  {playerPos.x === x && playerPos.y === y && (
                    <motion.div
                      className="absolute inset-0 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      😊
                    </motion.div>
                  )}
                  {cell === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs">
                      🎯
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 block sm:hidden">
          <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
            <div></div>
            <motion.button
              className="bg-blue-500 text-white p-3 rounded-lg font-bold"
              onClick={() => movePlayer('up')}
              whileTap={{ scale: 0.9 }}
            >
              ↑
            </motion.button>
            <div></div>
            <motion.button
              className="bg-blue-500 text-white p-3 rounded-lg font-bold"
              onClick={() => movePlayer('left')}
              whileTap={{ scale: 0.9 }}
            >
              ←
            </motion.button>
            <div></div>
            <motion.button
              className="bg-blue-500 text-white p-3 rounded-lg font-bold"
              onClick={() => movePlayer('right')}
              whileTap={{ scale: 0.9 }}
            >
              →
            </motion.button>
            <div></div>
            <motion.button
              className="bg-blue-500 text-white p-3 rounded-lg font-bold"
              onClick={() => movePlayer('down')}
              whileTap={{ scale: 0.9 }}
            >
              ↓
            </motion.button>
            <div></div>
          </div>
        </div>

        {/* Instructions & Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              <span className="hidden sm:inline">Use arrow keys or WASD to move.</span>
              <span className="sm:hidden">Use the buttons above to move.</span>
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">Focus on each step mindfully. The journey matters more than speed.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center justify-center space-x-2 font-medium"
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </motion.button>
            
            <motion.button
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-medium flex items-center justify-center space-x-2"
              onClick={() => onComplete(Math.max(20, 100 - moves - Math.floor(timeSpent / 10)))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-4 h-4" />
              <span>Complete</span>
            </motion.button>
          </div>
        </div>

        {isComplete && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 text-center max-w-sm w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Maze Complete!</h3>
              <p className="text-gray-600 mb-4">You navigated mindfully in {moves} moves</p>
              <motion.button
                className="bg-purple-500 text-white px-6 py-3 rounded-full font-medium"
                onClick={() => onComplete(Math.max(20, 100 - moves - Math.floor(timeSpent / 10)))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};