import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, Star, Target, Trophy, Timer } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  type: 'normal' | 'bonus' | 'stress' | 'power';
  points: number;
  anxiety: number;
}

interface PowerUp {
  id: string;
  type: 'slow_time' | 'double_points' | 'stress_relief' | 'bubble_storm';
  duration: number;
  active: boolean;
}

interface BubblePopGameProps {
  onComplete: (score: number) => void;
}

export const BubblePopGame: React.FC<BubblePopGameProps> = ({ onComplete }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameActive, setGameActive] = useState(true);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stressLevel, setStressLevel] = useState(8);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [level, setLevel] = useState(1);
  const [bubblesPopped, setBubblesPopped] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalClicks, setTotalClicks] = useState(0);
  const [successfulPops, setSuccessfulPops] = useState(0);
  
  const sounds = useSoundEffects();

  const bubbleTypes = [
    { type: 'normal' as const, color: 'from-blue-400 to-cyan-400', points: 10, anxiety: -0.1, probability: 0.6 },
    { type: 'bonus' as const, color: 'from-yellow-400 to-orange-400', points: 25, anxiety: -0.2, probability: 0.2 },
    { type: 'stress' as const, color: 'from-red-400 to-pink-400', points: 50, anxiety: -0.5, probability: 0.15 },
    { type: 'power' as const, color: 'from-purple-400 to-violet-400', points: 100, anxiety: -1, probability: 0.05 }
  ];

  const createBubble = useCallback((): Bubble => {
    const rand = Math.random();
    let selectedType = bubbleTypes[0];
    let cumulative = 0;
    
    for (const type of bubbleTypes) {
      cumulative += type.probability;
      if (rand <= cumulative) {
        selectedType = type;
        break;
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (window.innerWidth - 100),
      y: window.innerHeight + 50,
      size: selectedType.type === 'power' ? 80 : Math.random() * 40 + 40,
      color: selectedType.color,
      speed: Math.random() * 2 + 1 + (level * 0.2),
      type: selectedType.type,
      points: selectedType.points * level,
      anxiety: selectedType.anxiety
    };
  }, [level]);

  // Generate bubbles based on level
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setBubbles(prev => {
        const maxBubbles = Math.min(8 + level, 15);
        if (prev.length < maxBubbles) {
          return [...prev, createBubble()];
        }
        return prev;
      });
    }, Math.max(500 - (level * 50), 200));

    return () => clearInterval(interval);
  }, [gameActive, createBubble, level]);

  // Move bubbles and handle missed bubbles
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setBubbles(prev => {
        const updated = prev
          .map(bubble => ({ ...bubble, y: bubble.y - bubble.speed }))
          .filter(bubble => {
            if (bubble.y > -100) return true;
            
            // Missed bubble - increase stress slightly
            if (bubble.type === 'stress') {
              setStressLevel(s => Math.min(10, s + 0.3));
            }
            return false;
          });
        
        return updated;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [gameActive]);

  // Game timer and level progression
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          completeGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Level up logic
  useEffect(() => {
    const newLevel = Math.floor(bubblesPopped / 20) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      sounds.achievement();
      
      // Add power-up on level up
      const powerUpTypes: PowerUp['type'][] = ['slow_time', 'double_points', 'stress_relief', 'bubble_storm'];
      const randomPowerUp: PowerUp = {
        id: Date.now().toString(),
        type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
        duration: 10,
        active: false
      };
      setPowerUps(prev => [...prev, randomPowerUp]);
    }
  }, [bubblesPopped, level, sounds]);

  // Update accuracy
  useEffect(() => {
    if (totalClicks > 0) {
      setAccuracy(Math.round((successfulPops / totalClicks) * 100));
    }
  }, [totalClicks, successfulPops]);

  const popBubble = (bubbleId: string) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    
    // Calculate points with combo multiplier
    const comboMultiplier = Math.floor(combo / 5) + 1;
    const points = bubble.points * comboMultiplier;
    
    setScore(prev => prev + points);
    setBubblesPopped(prev => prev + 1);
    setSuccessfulPops(prev => prev + 1);
    setCombo(prev => {
      const newCombo = prev + 1;
      setMaxCombo(max => Math.max(max, newCombo));
      return newCombo;
    });
    
    // Reduce stress based on bubble type
    setStressLevel(prev => Math.max(0, prev + bubble.anxiety));
    
    // Enhanced sound effects based on bubble type
    switch (bubble.type) {
      case 'normal':
        sounds.bubblePop();
        break;
      case 'bonus':
        sounds.success();
        break;
      case 'stress':
        sounds.zen();
        break;
      case 'power':
        sounds.achievement();
        activateRandomPowerUp();
        break;
    }

    // Reset combo after delay
    setTimeout(() => setCombo(0), 2000);
  };

  const activateRandomPowerUp = () => {
    const availablePowerUps = powerUps.filter(p => !p.active);
    if (availablePowerUps.length === 0) return;

    const powerUp = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
    
    setPowerUps(prev => prev.map(p => 
      p.id === powerUp.id ? { ...p, active: true } : p
    ));

    // Apply power-up effects
    switch (powerUp.type) {
      case 'slow_time':
        // Slow down bubble movement
        setBubbles(prev => prev.map(b => ({ ...b, speed: b.speed * 0.3 })));
        break;
      case 'double_points':
        // Double points for duration (handled in scoring)
        break;
      case 'stress_relief':
        setStressLevel(prev => Math.max(0, prev - 3));
        break;
      case 'bubble_storm':
        // Create many bubbles
        const stormBubbles = Array.from({ length: 10 }, () => createBubble());
        setBubbles(prev => [...prev, ...stormBubbles]);
        break;
    }

    // Deactivate after duration
    setTimeout(() => {
      setPowerUps(prev => prev.map(p => 
        p.id === powerUp.id ? { ...p, active: false } : p
      ));
      
      if (powerUp.type === 'slow_time') {
        setBubbles(prev => prev.map(b => ({ ...b, speed: b.speed / 0.3 })));
      }
    }, powerUp.duration * 1000);
  };

  const handleMissedClick = () => {
    setTotalClicks(prev => prev + 1);
    setCombo(0);
  };

  const completeGame = () => {
    const stressReduction = ((8 - stressLevel) / 8) * 30;
    const accuracyBonus = (accuracy / 100) * 25;
    const comboBonus = (maxCombo / 50) * 25;
    const levelBonus = level * 5;
    const timeBonus = timeLeft > 0 ? 15 : 0;
    
    const finalScore = Math.round(stressReduction + accuracyBonus + comboBonus + levelBonus + timeBonus);
    onComplete(finalScore);
  };

  const reset = () => {
    setBubbles([]);
    setScore(0);
    setTimeLeft(90);
    setGameActive(true);
    setCombo(0);
    setMaxCombo(0);
    setStressLevel(8);
    setPowerUps([]);
    setLevel(1);
    setBubblesPopped(0);
    setAccuracy(100);
    setTotalClicks(0);
    setSuccessfulPops(0);
  };

  const activePowerUp = powerUps.find(p => p.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced HUD */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">{score}</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{bubblesPopped}</div>
              <div className="text-xs text-gray-600">Popped</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">{combo}x</div>
              <div className="text-xs text-gray-600">Combo</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600">{accuracy}%</div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{Math.round(stressLevel)}/10</div>
              <div className="text-xs text-gray-600">Stress</div>
            </div>
            <div>
              <div className="text-xl font-bold text-indigo-600">L{level}</div>
              <div className="text-xs text-gray-600">Level</div>
            </div>
          </div>
          
          {/* Stress Level Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full transition-colors duration-500 ${
                  stressLevel > 7 ? 'bg-red-500' :
                  stressLevel > 4 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                initial={{ width: '80%' }}
                animate={{ width: `${(stressLevel / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="mt-2 text-center">
            <span className="text-lg font-bold text-gray-800">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Active Power-up Indicator */}
      {activePowerUp && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <motion.div
            className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            {activePowerUp.type.replace('_', ' ').toUpperCase()} ACTIVE!
          </motion.div>
        </div>
      )}

      {/* Game Area */}
      <div 
        className="min-h-screen pt-32 pb-20"
        onClick={handleMissedClick}
      >
        {/* Instructions */}
        {bubbles.length === 0 && gameActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center text-gray-600 bg-white/80 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">🫧</div>
              <div className="text-xl font-semibold mb-2">Advanced Bubble Therapy</div>
              <div className="text-lg mb-4">Pop bubbles to reduce stress and anxiety</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <div className="font-semibold text-blue-800">Normal Bubbles</div>
                  <div className="text-blue-600">Basic stress relief</div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <div className="font-semibold text-yellow-800">Bonus Bubbles</div>
                  <div className="text-yellow-600">Extra points & relief</div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <div className="font-semibold text-red-800">Stress Bubbles</div>
                  <div className="text-red-600">Major anxiety relief</div>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <div className="font-semibold text-purple-800">Power Bubbles</div>
                  <div className="text-purple-600">Activate special abilities</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bubbles */}
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              className={`absolute cursor-pointer bg-gradient-to-br ${bubble.color} rounded-full shadow-lg flex items-center justify-center`}
              style={{
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                setTotalClicks(prev => prev + 1);
                popBubble(bubble.id);
              }}
            >
              {/* Bubble highlight */}
              <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full" />
              <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full" />
              
              {/* Bubble type indicator */}
              <div className="text-white font-bold text-sm">
                {bubble.type === 'bonus' && '⭐'}
                {bubble.type === 'stress' && '💥'}
                {bubble.type === 'power' && '⚡'}
                {bubble.type === 'normal' && '+' + bubble.points}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Power-ups Panel */}
      {powerUps.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 rounded-xl p-3 shadow-lg">
          <div className="text-sm font-semibold text-gray-800 mb-2">Power-ups Available:</div>
          <div className="space-y-1">
            {powerUps.map(powerUp => (
              <div
                key={powerUp.id}
                className={`text-xs px-2 py-1 rounded ${
                  powerUp.active ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {powerUp.type.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4">
        <motion.button
          className="bg-gray-200 text-gray-800 p-3 rounded-full shadow-lg"
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Game Over Screen */}
      {!gameActive && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Therapy Complete!</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-semibold text-blue-800">Bubbles Popped</div>
                <div className="text-2xl font-bold text-blue-600">{bubblesPopped}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-semibold text-green-800">Max Combo</div>
                <div className="text-2xl font-bold text-green-600">{maxCombo}x</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="font-semibold text-purple-800">Accuracy</div>
                <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="font-semibold text-orange-800">Level Reached</div>
                <div className="text-2xl font-bold text-orange-600">{level}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-lg font-semibold text-gray-800">Stress Reduction</div>
              <div className="text-3xl font-bold text-green-600">{Math.round(((8 - stressLevel) / 8) * 100)}%</div>
            </div>
            
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