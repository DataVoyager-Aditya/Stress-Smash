import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, Volume2, VolumeX, Play, Pause, Share2, Users, Settings, X } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface SmashObject {
  id: string;
  x: number;
  y: number;
  type: 'box' | 'plate' | 'balloon' | 'ice' | 'powerup';
  color: string;
  size: number;
  points: number;
}

interface AngerSmashGameProps {
  onComplete: (score: number) => void;
}

interface AudioSettings {
  sfxVolume: number;
  lastSfxTime: number;
}

interface GameSettings {
  showParticles: boolean;
  autoShare: boolean;
}

export const AngerSmashGame: React.FC<AngerSmashGameProps> = ({ onComplete }) => {
  const [objects, setObjects] = useState<SmashObject[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameActive, setGameActive] = useState(true);
  const [combo, setCombo] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Audio state (removed background music)
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    sfxVolume: 60,
    lastSfxTime: 0
  });
  
  // Game settings
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    showParticles: true,
    autoShare: false
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sounds = useSoundEffects();

  const objectTypes = [
    { type: 'box' as const, icon: '📦', color: 'from-amber-400 to-orange-500', points: 10 },
    { type: 'plate' as const, icon: '🍽️', color: 'from-blue-400 to-cyan-500', points: 15 },
    { type: 'balloon' as const, icon: '🎈', color: 'from-red-400 to-pink-500', points: 20 },
    { type: 'ice' as const, icon: '🧊', color: 'from-cyan-300 to-blue-400', points: 25 },
    { type: 'powerup' as const, icon: '⚡', color: 'from-yellow-400 to-orange-400', points: 50 }
  ];

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  const playSound = (frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine') => {
    if (!audioContextRef.current) return;

    const now = Date.now();
    if (now - audioSettings.lastSfxTime < 100) return; // Reduced delay for better responsiveness

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const volume = audioSettings.sfxVolume / 100;
      gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
      
      setAudioSettings(prev => ({ ...prev, lastSfxTime: now }));
    } catch (error) {
      console.log('Sound effect failed');
    }
  };

  const createObject = (): SmashObject => {
    const objType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (window.innerWidth - 100),
      y: Math.random() * (window.innerHeight - 200) + 100,
      type: objType.type,
      color: objType.color,
      size: Math.random() * 30 + 50,
      points: objType.points
    };
  };

  useEffect(() => {
    if (!gameActive || !gameStarted) return;

    const interval = setInterval(() => {
      setObjects(prev => {
        if (prev.length < 8) {
          return [...prev, createObject()];
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [gameActive, gameStarted]);

  useEffect(() => {
    if (!gameActive || !gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          if (gameSettings.autoShare && score > 100) {
            setShowShareModal(true);
          }
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameStarted, score, onComplete, gameSettings.autoShare]);

  const smashObject = (objectId: string) => {
    const object = objects.find(obj => obj.id === objectId);
    if (!object) return;

    setObjects(prev => prev.filter(obj => obj.id !== objectId));
    setScore(prev => prev + object.points + (combo * 2));
    setCombo(prev => prev + 1);
    
    // Play appropriate sound effect
    switch (object.type) {
      case 'box':
        playSound(150, 0.3, 'square'); // Ball impact (60% volume)
        break;
      case 'plate':
      case 'ice':
        playSound(800, 0.2, 'sawtooth'); // Object destruction (70% volume)
        break;
      case 'powerup':
        playSound(1200, 0.15, 'sine'); // Power-up collection (50% volume)
        break;
      default:
        playSound(400, 0.25, 'triangle');
    }
    
    setTimeout(() => setCombo(0), 2000);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameActive(true);
    setScore(0);
    setCombo(0);
    setTimeLeft(90);
    setObjects([]);
  };

  const reset = () => {
    setObjects([]);
    setScore(0);
    setTimeLeft(90);
    setGameActive(true);
    setCombo(0);
    setGameStarted(false);
  };

  const shareScore = () => {
    const shareText = `I just smashed my stress away and scored ${score} points in StressSmash! 💥 Taking care of my mental health one smash at a time. #StressRelief #MentalHealth`;
    
    if (navigator.share) {
      navigator.share({
        title: 'StressSmash Score',
        text: shareText,
        url: window.location.origin
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Score copied to clipboard!');
      }).catch(console.error);
    }
    setShowShareModal(false);
  };

  const getObjectIcon = (type: string) => {
    const obj = objectTypes.find(o => o.type === type);
    return obj?.icon || '📦';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 text-gray-800 relative overflow-hidden">
      {/* Header with enhanced controls */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{score}</div>
                <div className="text-sm opacity-75">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{timeLeft}s</div>
                <div className="text-sm opacity-75">Time Left</div>
              </div>
              {combo > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{combo}x</div>
                  <div className="text-sm text-orange-600">Combo</div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Settings */}
              <motion.button
                className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
                onClick={() => setShowSettings(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Game Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              {/* Reset */}
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
          </div>
        </div>
      </div>

      {/* Game Start Screen */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">💥</div>
            <div className="text-2xl font-bold mb-2">Anger Smash Game</div>
            <div className="text-lg mb-6 opacity-75">Release your frustration safely!</div>
            <motion.button
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg"
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6 mr-2 inline" />
              Start Smashing
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Instructions */}
      {gameStarted && objects.length === 0 && gameActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center opacity-75"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">💥</div>
            <div className="text-xl font-semibold mb-2">Get Ready to Smash!</div>
            <div className="text-lg">Objects will appear soon. Tap them to release stress!</div>
          </motion.div>
        </div>
      )}

      {/* Smashable Objects */}
      <AnimatePresence>
        {objects.map((object) => (
          <motion.div
            key={object.id}
            className={`absolute cursor-pointer bg-gradient-to-br ${object.color} rounded-lg shadow-lg flex items-center justify-center text-4xl select-none`}
            style={{
              left: object.x - object.size / 2,
              top: object.y - object.size / 2,
              width: object.size,
              height: object.size,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: Math.random() * 20 - 10 }}
            exit={{ 
              scale: 0, 
              rotate: 360,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            whileHover={{ scale: 1.1, rotate: 0 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => smashObject(object.id)}
          >
            {getObjectIcon(object.type)}
            
            {/* Enhanced smash effect */}
            <motion.div
              className="absolute inset-0 bg-yellow-400 rounded-lg opacity-0"
              whileTap={{ 
                opacity: [0, 0.8, 0], 
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Particle effects */}
            {gameSettings.showParticles && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                whileTap={{
                  background: [
                    'radial-gradient(circle, rgba(255,255,0,0) 0%, rgba(255,255,0,0) 100%)',
                    'radial-gradient(circle, rgba(255,255,0,0.8) 0%, rgba(255,165,0,0.6) 50%, rgba(255,0,0,0) 100%)',
                    'radial-gradient(circle, rgba(255,255,0,0) 0%, rgba(255,255,0,0) 100%)'
                  ]
                }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* Points indicator */}
            <div className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-bold px-1 py-0.5 rounded-full">
              +{object.points}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Game Over Screen */}
      {!gameActive && gameStarted && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white text-gray-800 rounded-2xl p-8 text-center max-w-md mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-2">Frustration Released!</h3>
            <p className="mb-4">Final Score: <span className="font-bold text-2xl text-orange-500">{score}</span></p>
            <p className="text-sm opacity-75 mb-6">
              Physical release activities help process anger in a healthy way
            </p>
            <div className="flex space-x-3">
              <motion.button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium"
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
              <motion.button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium"
                onClick={() => setShowShareModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4 mr-2 inline" />
                Share
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-800 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Game Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="opacity-50 hover:opacity-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Audio Settings */}
                <div>
                  <h4 className="font-medium mb-3">Audio Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Sound Effects Volume: {audioSettings.sfxVolume}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioSettings.sfxVolume}
                        onChange={(e) => setAudioSettings(prev => ({ ...prev, sfxVolume: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Settings */}
                <div>
                  <h4 className="font-medium mb-3">Visual Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span>Show Particle Effects</span>
                      <input
                        type="checkbox"
                        checked={gameSettings.showParticles}
                        onChange={(e) => setGameSettings(prev => ({ ...prev, showParticles: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Auto-share High Scores</span>
                      <input
                        type="checkbox"
                        checked={gameSettings.autoShare}
                        onChange={(e) => setGameSettings(prev => ({ ...prev, autoShare: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-800 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold mb-2">Share Your Achievement!</h3>
                <p className="mb-4">You scored {score} points! Share your stress-busting success.</p>
                
                <div className="flex space-x-3">
                  <motion.button
                    onClick={shareScore}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="w-4 h-4 mr-2 inline" />
                    Share Score
                  </motion.button>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};