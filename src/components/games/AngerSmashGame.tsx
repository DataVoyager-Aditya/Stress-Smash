import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, Volume2, VolumeX, Play, Pause, Share2, Users, Settings, X, Target, Trophy, Flame } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface SmashObject {
  id: string;
  x: number;
  y: number;
  type: 'box' | 'plate' | 'balloon' | 'ice' | 'powerup' | 'stress_ball' | 'anger_cloud';
  color: string;
  size: number;
  points: number;
  health: number;
  maxHealth: number;
  angerRelief: number;
}

interface AngerSmashGameProps {
  onComplete: (score: number) => void;
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

export const AngerSmashGame: React.FC<AngerSmashGameProps> = ({ onComplete }) => {
  const [objects, setObjects] = useState<SmashObject[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameActive, setGameActive] = useState(true);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [angerLevel, setAngerLevel] = useState(9);
  const [frustrationMeter, setFrustrationMeter] = useState(8);
  const [objectsSmashed, setObjectsSmashed] = useState(0);
  const [powerMode, setPowerMode] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sounds = useSoundEffects();

  const objectTypes = [
    { 
      type: 'box' as const, 
      emoji: '📦', 
      color: 'from-amber-400 to-orange-500', 
      points: 15, 
      health: 1,
      angerRelief: 0.2,
      description: 'Basic stress relief'
    },
    { 
      type: 'plate' as const, 
      emoji: '🍽️', 
      color: 'from-blue-400 to-cyan-500', 
      points: 25, 
      health: 1,
      angerRelief: 0.3,
      description: 'Satisfying crash'
    },
    { 
      type: 'balloon' as const, 
      emoji: '🎈', 
      color: 'from-red-400 to-pink-500', 
      points: 10, 
      health: 1,
      angerRelief: 0.1,
      description: 'Quick pop relief'
    },
    { 
      type: 'ice' as const, 
      emoji: '🧊', 
      color: 'from-cyan-300 to-blue-400', 
      points: 40, 
      health: 2,
      angerRelief: 0.5,
      description: 'Cool down anger'
    },
    { 
      type: 'stress_ball' as const, 
      emoji: '⚽', 
      color: 'from-green-400 to-emerald-500', 
      points: 60, 
      health: 3,
      angerRelief: 0.8,
      description: 'Major stress relief'
    },
    { 
      type: 'anger_cloud' as const, 
      emoji: '☁️', 
      color: 'from-gray-400 to-slate-500', 
      points: 100, 
      health: 5,
      angerRelief: 1.5,
      description: 'Dispel negative thoughts'
    },
    { 
      type: 'powerup' as const, 
      emoji: '⚡', 
      color: 'from-yellow-400 to-orange-400', 
      points: 80, 
      health: 1,
      angerRelief: 0.3,
      description: 'Activate power mode'
    }
  ];

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  const playSmashSound = (type: string, intensity: number = 1) => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Different sounds for different objects
      switch (type) {
        case 'box':
          oscillator.frequency.value = 150 * intensity;
          oscillator.type = 'square';
          break;
        case 'plate':
        case 'ice':
          oscillator.frequency.value = 800 * intensity;
          oscillator.type = 'sawtooth';
          break;
        case 'stress_ball':
          oscillator.frequency.value = 300 * intensity;
          oscillator.type = 'triangle';
          break;
        case 'anger_cloud':
          oscillator.frequency.value = 200 * intensity;
          oscillator.type = 'sine';
          break;
        default:
          oscillator.frequency.value = 400 * intensity;
          oscillator.type = 'triangle';
      }
      
      const volume = Math.min(0.3 * intensity, 0.6);
      gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.log('Sound effect failed');
    }
  };

  const createObject = (): SmashObject => {
    const objType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (window.innerWidth - 150) + 75,
      y: Math.random() * (window.innerHeight - 300) + 150,
      type: objType.type,
      color: objType.color,
      size: Math.random() * 30 + 60,
      points: objType.points,
      health: objType.health,
      maxHealth: objType.health,
      angerRelief: objType.angerRelief
    };
  };

  const createParticles = (x: number, y: number, color: string, count: number = 12) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color,
        life: 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98 + 0.2,
          life: particle.life - 0.02
        }))
        .filter(particle => particle.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!gameActive || !gameStarted) return;

    const interval = setInterval(() => {
      setObjects(prev => {
        const maxObjects = powerMode ? 12 : 8;
        if (prev.length < maxObjects) {
          return [...prev, createObject()];
        }
        return prev;
      });
    }, powerMode ? 800 : 1500);

    return () => clearInterval(interval);
  }, [gameActive, gameStarted, powerMode]);

  useEffect(() => {
    if (!gameActive || !gameStarted) return;

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
  }, [gameActive, gameStarted]);

  // Power mode timer
  useEffect(() => {
    if (powerMode) {
      const timer = setTimeout(() => {
        setPowerMode(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [powerMode]);

  const smashObject = (objectId: string) => {
    const object = objects.find(obj => obj.id === objectId);
    if (!object) return;

    const newHealth = object.health - 1;
    
    if (newHealth <= 0) {
      // Object destroyed
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
      
      const comboMultiplier = Math.floor(combo / 5) + 1;
      const powerMultiplier = powerMode ? 2 : 1;
      const points = object.points * comboMultiplier * powerMultiplier;
      
      setScore(prev => prev + points);
      setObjectsSmashed(prev => prev + 1);
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(max => Math.max(max, newCombo));
        return newCombo;
      });
      
      // Reduce anger and frustration
      setAngerLevel(prev => Math.max(0, prev - object.angerRelief));
      setFrustrationMeter(prev => Math.max(0, prev - object.angerRelief * 0.5));
      
      // Create destruction particles
      createParticles(object.x, object.y, object.color.includes('red') ? '#ef4444' : '#3b82f6', 15);
      
      // Play appropriate sound
      playSmashSound(object.type, comboMultiplier);
      
      // Special effects for different objects
      if (object.type === 'powerup') {
        setPowerMode(true);
        sounds.achievement();
      } else if (object.type === 'anger_cloud') {
        sounds.zen();
        // Extra particle effect for anger clouds
        createParticles(object.x, object.y, '#6b7280', 25);
      } else {
        sounds.smash();
      }
      
      // Check for achievements
      checkAchievements();
      
    } else {
      // Object damaged but not destroyed
      setObjects(prev => prev.map(obj => 
        obj.id === objectId ? { ...obj, health: newHealth } : obj
      ));
      
      // Create smaller particle effect
      createParticles(object.x, object.y, '#fbbf24', 6);
      playSmashSound(object.type, 0.5);
    }
    
    // Reset combo after delay
    setTimeout(() => setCombo(0), 3000);
  };

  const checkAchievements = () => {
    const newAchievements = [];
    
    if (combo >= 20 && !achievements.includes('Combo Master')) {
      newAchievements.push('Combo Master');
    }
    if (angerLevel <= 2 && !achievements.includes('Zen Achieved')) {
      newAchievements.push('Zen Achieved');
    }
    if (objectsSmashed >= 50 && !achievements.includes('Destruction Expert')) {
      newAchievements.push('Destruction Expert');
    }
    if (powerMode && !achievements.includes('Power User')) {
      newAchievements.push('Power User');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      sounds.achievement();
    }
  };

  const completeGame = () => {
    const angerReduction = ((9 - angerLevel) / 9) * 40;
    const frustrationReduction = ((8 - frustrationMeter) / 8) * 30;
    const comboBonus = (maxCombo / 100) * 20;
    const achievementBonus = achievements.length * 5;
    const timeBonus = timeLeft > 0 ? 5 : 0;
    
    const finalScore = Math.round(angerReduction + frustrationReduction + comboBonus + achievementBonus + timeBonus);
    onComplete(finalScore);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameActive(true);
    sounds.success();
  };

  const reset = () => {
    setObjects([]);
    setParticles([]);
    setScore(0);
    setTimeLeft(120);
    setGameActive(true);
    setCombo(0);
    setMaxCombo(0);
    setAngerLevel(9);
    setFrustrationMeter(8);
    setObjectsSmashed(0);
    setPowerMode(false);
    setGameStarted(false);
    setAchievements([]);
  };

  const getObjectIcon = (type: string) => {
    const obj = objectTypes.find(o => o.type === type);
    return obj?.emoji || '📦';
  };

  const getHealthBarColor = (health: number, maxHealth: number) => {
    const percentage = health / maxHealth;
    if (percentage > 0.6) return 'bg-green-500';
    if (percentage > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 text-gray-800 relative overflow-hidden">
      {/* Power Mode Overlay */}
      {powerMode && (
        <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none z-10 animate-pulse" />
      )}

      {/* Enhanced HUD */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-3">
            <div>
              <div className="text-xl font-bold text-orange-600">{score}</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{objectsSmashed}</div>
              <div className="text-xs text-gray-600">Smashed</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">{combo}x</div>
              <div className="text-xs text-gray-600">Combo</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">{Math.round(angerLevel)}/10</div>
              <div className="text-xs text-gray-600">Anger</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs text-gray-600">Time</div>
            </div>
          </div>
          
          {/* Anger Level Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Anger Level</span>
              <span>{Math.round(angerLevel)}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full transition-colors duration-500 ${
                  angerLevel > 7 ? 'bg-red-500' :
                  angerLevel > 4 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                initial={{ width: '90%' }}
                animate={{ width: `${(angerLevel / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Frustration Meter */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Frustration</span>
              <span>{Math.round(frustrationMeter)}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-orange-500 h-2 rounded-full"
                initial={{ width: '80%' }}
                animate={{ width: `${(frustrationMeter / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Power Mode Indicator */}
          {powerMode && (
            <div className="mt-2 text-center">
              <motion.div
                className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-flex items-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 mr-1" />
                POWER MODE ACTIVE!
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Game Start Screen */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <motion.div
            className="text-center bg-white/90 rounded-2xl p-8 max-w-md mx-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">💥</div>
            <div className="text-2xl font-bold mb-4">Advanced Anger Release Therapy</div>
            <div className="text-lg mb-6 text-gray-600">
              Scientifically designed to help you release anger and frustration safely
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              {objectTypes.slice(0, 4).map((type, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="font-semibold text-gray-800">{type.type.replace('_', ' ')}</div>
                  <div className="text-xs text-gray-600">{type.description}</div>
                </div>
              ))}
            </div>
            
            <motion.button
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg"
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6 mr-2 inline" />
              Start Anger Release Session
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Smashable Objects */}
      <AnimatePresence>
        {objects.map((object) => (
          <motion.div
            key={object.id}
            className={`absolute cursor-pointer bg-gradient-to-br ${object.color} rounded-lg shadow-lg flex flex-col items-center justify-center text-4xl select-none ${
              powerMode ? 'ring-4 ring-yellow-400' : ''
            }`}
            style={{
              left: object.x - object.size / 2,
              top: object.y - object.size / 2,
              width: object.size,
              height: object.size,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: 1, 
              rotate: Math.random() * 20 - 10,
              y: [0, -5, 0]
            }}
            exit={{ 
              scale: 0, 
              rotate: 360,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            whileHover={{ scale: 1.1, rotate: 0 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => smashObject(object.id)}
            transition={{
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {getObjectIcon(object.type)}
            
            {/* Health bar for multi-hit objects */}
            {object.maxHealth > 1 && (
              <div className="absolute -bottom-2 left-1 right-1 bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all ${getHealthBarColor(object.health, object.maxHealth)}`}
                  style={{ width: `${(object.health / object.maxHealth) * 100}%` }}
                />
              </div>
            )}
            
            {/* Points indicator */}
            <div className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-bold px-1 py-0.5 rounded-full">
              +{object.points}
            </div>

            {/* Smash effect */}
            <motion.div
              className="absolute inset-0 bg-yellow-400 rounded-lg opacity-0"
              whileTap={{ 
                opacity: [0, 0.8, 0], 
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              opacity: particle.life
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Achievements Display */}
      <AnimatePresence>
        {achievements.length > 0 && (
          <motion.div
            className="absolute top-32 right-4 bg-yellow-400 text-gray-800 p-3 rounded-lg shadow-lg z-20"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            <span className="font-semibold">Achievement Unlocked!</span>
            <div className="text-sm mt-1">
              {achievements[achievements.length - 1]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <motion.button
          className="bg-gray-500 text-white p-3 rounded-full shadow-lg"
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Reset Game"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Game Over Screen */}
      {!gameActive && gameStarted && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white text-gray-800 rounded-2xl p-8 text-center max-w-md mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Anger Released!</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="font-semibold text-red-800">Anger Reduction</div>
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(((9 - angerLevel) / 9) * 100)}%
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="font-semibold text-orange-800">Objects Smashed</div>
                <div className="text-2xl font-bold text-orange-600">{objectsSmashed}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="font-semibold text-purple-800">Max Combo</div>
                <div className="text-2xl font-bold text-purple-600">{maxCombo}x</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="font-semibold text-yellow-800">Achievements</div>
                <div className="text-2xl font-bold text-yellow-600">{achievements.length}</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Physical release activities help process anger in a healthy, controlled way. 
              You've successfully channeled your frustration into positive action!
            </p>
            
            <div className="flex space-x-3">
              <motion.button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium"
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Release More Anger
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};