import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower, RotateCcw, Heart } from 'lucide-react';

interface Plant {
  id: string;
  x: number;
  y: number;
  type: 'flower' | 'tree' | 'grass' | 'butterfly';
  growth: number;
  color: string;
}

interface MeditationGardenGameProps {
  onComplete: (score: number) => void;
}

export const MeditationGardenGame: React.FC<MeditationGardenGameProps> = ({ onComplete }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);

  const plantTypes = [
    { type: 'flower' as const, emoji: '🌸', colors: ['from-pink-400 to-rose-500', 'from-purple-400 to-violet-500', 'from-yellow-400 to-orange-400'] },
    { type: 'tree' as const, emoji: '🌳', colors: ['from-green-400 to-emerald-500', 'from-teal-400 to-cyan-500'] },
    { type: 'grass' as const, emoji: '🌱', colors: ['from-green-300 to-green-500', 'from-lime-400 to-green-400'] },
    { type: 'butterfly' as const, emoji: '🦋', colors: ['from-blue-400 to-purple-500', 'from-pink-400 to-red-400'] }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Breathing animation cycle
  useEffect(() => {
    const breathingTimer = setInterval(() => {
      setBreathingPhase(prev => {
        if (prev === 'inhale') {
          return 'exhale';
        } else {
          setBreathingCycle(c => c + 1);
          return 'inhale';
        }
      });
    }, 4000); // 4 seconds per phase

    return () => clearInterval(breathingTimer);
  }, []);

  // Auto-grow plants during breathing
  useEffect(() => {
    if (breathingCycle > 0 && breathingCycle % 3 === 0) {
      const plantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
      const colors = plantType.colors;
      
      const newPlant: Plant = {
        id: Date.now().toString(),
        x: Math.random() * 80 + 10, // 10-90% of container width
        y: Math.random() * 60 + 20, // 20-80% of container height
        type: plantType.type,
        growth: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      setPlants(prev => [...prev, newPlant]);
    }
  }, [breathingCycle]);

  // Grow existing plants
  useEffect(() => {
    const growthTimer = setInterval(() => {
      setPlants(prev => prev.map(plant => ({
        ...plant,
        growth: Math.min(plant.growth + 0.1, 1)
      })));
    }, 500);

    return () => clearInterval(growthTimer);
  }, []);

  const addPlant = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const plantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    const colors = plantType.colors;

    const newPlant: Plant = {
      id: Date.now().toString(),
      x,
      y,
      type: plantType.type,
      growth: 0,
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setPlants(prev => [...prev, newPlant]);
  };

  const reset = () => {
    setPlants([]);
    setTimeSpent(0);
    setBreathingCycle(0);
  };

  const finishSession = () => {
    const score = Math.min(Math.round((plants.length * 5) + (breathingCycle * 2) + (timeSpent / 60) * 10), 100);
    onComplete(score);
  };

  const getPlantEmoji = (type: string) => {
    const plant = plantTypes.find(p => p.type === type);
    return plant?.emoji || '🌸';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Meditation Garden</h2>
          <p className="text-gray-600">Breathe deeply and watch your peaceful garden grow</p>
        </div>

        {/* Breathing Guide */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-8">
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-2xl"
              animate={{
                scale: breathingPhase === 'inhale' ? 1.3 : 0.8,
              }}
              transition={{
                duration: 4,
                ease: 'easeInOut'
              }}
            >
              {breathingPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
            </motion.div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{breathingCycle}</div>
              <div className="text-sm text-gray-600">Breathing Cycles</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{plants.length}</div>
              <div className="text-sm text-gray-600">Plants Grown</div>
            </div>
          </div>
        </div>

        {/* Garden Area */}
        <div 
          className="bg-gradient-to-b from-sky-200 to-green-200 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden min-h-96 cursor-pointer"
          onClick={addPlant}
        >
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-4 right-4 text-6xl opacity-30">☀️</div>
            <div className="absolute top-8 left-8 text-4xl opacity-40">☁️</div>
            <div className="absolute top-12 right-1/3 text-3xl opacity-40">☁️</div>
          </div>

          {/* Plants */}
          <AnimatePresence>
            {plants.map((plant) => (
              <motion.div
                key={plant.id}
                className="absolute"
                style={{
                  left: `${plant.x}%`,
                  top: `${plant.y}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: plant.growth,
                  opacity: plant.growth,
                  y: [0, -5, 0]
                }}
                transition={{
                  scale: { duration: 2 },
                  opacity: { duration: 2 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: plant.growth * 1.2 }}
              >
                <div className="text-4xl select-none">
                  {getPlantEmoji(plant.type)}
                </div>
                
                {/* Growth sparkles */}
                {plant.growth < 1 && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <span className="text-yellow-400 text-xs">✨</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {plants.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-center text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-6xl mb-4">🌸</div>
                <div className="text-xl font-semibold mb-2">Create Your Peaceful Garden</div>
                <div className="text-lg">Click anywhere to plant, or breathe deeply to auto-grow</div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{breathingPhase === 'inhale' ? '🫁' : '💨'}</div>
              <div className="text-sm text-gray-600">Breathing</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 font-medium"
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Garden</span>
            </motion.button>
            
            <motion.button
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-medium flex items-center space-x-2"
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
    </div>
  );
};