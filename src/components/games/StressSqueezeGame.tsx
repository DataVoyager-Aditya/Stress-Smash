import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap } from 'lucide-react';

interface StressBall {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  squeezeLevel: number;
  type: 'soft' | 'medium' | 'firm';
}

interface StressSqueezeGameProps {
  onComplete: (score: number) => void;
}

export const StressSqueezeGame: React.FC<StressSqueezeGameProps> = ({ onComplete }) => {
  const [stressBalls, setStressBalls] = useState<StressBall[]>([]);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [totalSqueezes, setTotalSqueezes] = useState(0);

  const ballTypes = [
    { type: 'soft' as const, color: 'from-blue-400 to-cyan-400', baseSize: 80 },
    { type: 'medium' as const, color: 'from-green-400 to-emerald-400', baseSize: 70 },
    { type: 'firm' as const, color: 'from-orange-400 to-red-400', baseSize: 60 }
  ];

  useEffect(() => {
    // Initialize stress balls
    const initialBalls: StressBall[] = [];
    for (let i = 0; i < 6; i++) {
      const ballType = ballTypes[Math.floor(Math.random() * ballTypes.length)];
      initialBalls.push({
        id: `ball-${i}`,
        x: (i % 3) * 250 + 125,
        y: Math.floor(i / 3) * 200 + 150,
        size: ballType.baseSize,
        color: ballType.color,
        squeezeLevel: 0,
        type: ballType.type
      });
    }
    setStressBalls(initialBalls);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-release squeeze over time
  useEffect(() => {
    const releaseTimer = setInterval(() => {
      setStressBalls(prev => prev.map(ball => ({
        ...ball,
        squeezeLevel: Math.max(0, ball.squeezeLevel - 0.1)
      })));
    }, 100);

    return () => clearInterval(releaseTimer);
  }, []);

  const squeezeBall = (ballId: string) => {
    setStressBalls(prev => prev.map(ball => {
      if (ball.id === ballId) {
        const maxSqueeze = ball.type === 'soft' ? 0.8 : ball.type === 'medium' ? 0.6 : 0.4;
        const newSqueezeLevel = Math.min(ball.squeezeLevel + 0.3, maxSqueeze);
        
        if (newSqueezeLevel > ball.squeezeLevel) {
          setTotalSqueezes(prev => prev + 1);
          setScore(prev => prev + Math.round(newSqueezeLevel * 10));
        }
        
        return {
          ...ball,
          squeezeLevel: newSqueezeLevel
        };
      }
      return ball;
    }));
  };

  const reset = () => {
    setStressBalls(prev => prev.map(ball => ({
      ...ball,
      squeezeLevel: 0
    })));
    setScore(0);
    setTimeSpent(0);
    setTotalSqueezes(0);
  };

  const finishSession = () => {
    const finalScore = Math.min(Math.round((totalSqueezes * 2) + (timeSpent / 60) * 10), 100);
    onComplete(finalScore);
  };

  const getBallSize = (ball: StressBall) => {
    return ball.size * (1 - ball.squeezeLevel * 0.5);
  };

  const getSqueezeIntensity = (squeezeLevel: number) => {
    if (squeezeLevel > 0.6) return 'High';
    if (squeezeLevel > 0.3) return 'Medium';
    if (squeezeLevel > 0) return 'Light';
    return 'None';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Stress Squeeze</h2>
          <p className="text-gray-600">Squeeze virtual stress balls to release tension safely</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">Stress Relief Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalSqueezes}</div>
              <div className="text-sm text-gray-600">Total Squeezes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {getSqueezeIntensity(Math.max(...stressBalls.map(b => b.squeezeLevel)))}
              </div>
              <div className="text-sm text-gray-600">Max Intensity</div>
            </div>
          </div>
        </div>

        {/* Stress Balls Area */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl p-8 mb-6 relative min-h-96">
          <AnimatePresence>
            {stressBalls.map((ball) => (
              <motion.div
                key={ball.id}
                className={`absolute cursor-pointer bg-gradient-to-br ${ball.color} rounded-full shadow-lg flex items-center justify-center select-none`}
                style={{
                  left: ball.x - getBallSize(ball) / 2,
                  top: ball.y - getBallSize(ball) / 2,
                  width: getBallSize(ball),
                  height: getBallSize(ball),
                }}
                onClick={() => squeezeBall(ball.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: [1, 1 + ball.squeezeLevel * 0.1, 1],
                  boxShadow: ball.squeezeLevel > 0 
                    ? `0 0 ${20 + ball.squeezeLevel * 30}px rgba(59, 130, 246, ${ball.squeezeLevel})`
                    : '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                transition={{
                  scale: { duration: 0.3 },
                  boxShadow: { duration: 0.2 }
                }}
              >
                {/* Ball texture */}
                <div className="absolute inset-2 bg-white/20 rounded-full" />
                <div className="absolute inset-4 bg-white/10 rounded-full" />
                
                {/* Squeeze indicator */}
                <div className="text-white font-bold text-lg">
                  {ball.type.toUpperCase()}
                </div>
                
                {/* Squeeze effects */}
                {ball.squeezeLevel > 0.5 && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      background: [
                        'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
                      ]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {totalSqueezes === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-center text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-6xl mb-4">🤏</div>
                <div className="text-xl font-semibold mb-2">Squeeze Away Your Stress!</div>
                <div className="text-lg">Click and hold the stress balls to squeeze them</div>
                <div className="text-sm mt-2 text-gray-500">Different types offer different resistance levels</div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Ball Types Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stress Ball Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ballTypes.map((type) => (
              <div key={type.type} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-full`} />
                <div>
                  <div className="font-medium capitalize">{type.type}</div>
                  <div className="text-sm text-gray-600">
                    {type.type === 'soft' ? 'Easy to squeeze, high relief' :
                     type.type === 'medium' ? 'Moderate resistance' :
                     'Firm resistance, focused relief'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-6">
          <div className="text-sm text-gray-600">
            <p className="mb-1">💡 <strong>Tip:</strong> Squeeze different balls for varied relief</p>
            <p>🎯 <strong>Goal:</strong> Find your perfect squeeze rhythm</p>
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
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium flex items-center space-x-2"
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
    </div>
  );
};