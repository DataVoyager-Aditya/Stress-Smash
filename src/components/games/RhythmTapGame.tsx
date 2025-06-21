import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface Beat {
  id: string;
  lane: number;
  timing: number;
  hit: boolean;
}

interface RhythmTapGameProps {
  onComplete: (score: number) => void;
}

export const RhythmTapGame: React.FC<RhythmTapGameProps> = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [bpm] = useState(120);
  const [lanes] = useState(4);

  const beatInterval = (60 / bpm) * 1000; // milliseconds per beat

  const createBeat = useCallback((lane: number, timing: number): Beat => ({
    id: `${lane}-${timing}-${Math.random()}`,
    lane,
    timing,
    hit: false
  }), []);

  // Generate beats
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 100);
      
      // Add new beats occasionally
      if (Math.random() < 0.3) {
        const lane = Math.floor(Math.random() * lanes);
        setBeats(prev => [...prev, createBeat(lane, Date.now() + 3000)]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, lanes, createBeat]);

  // Move beats and remove old ones
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setBeats(prev => prev.filter(beat => now - beat.timing < 1000));
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Auto-complete after 2 minutes
  useEffect(() => {
    if (gameTime >= 120000) { // 2 minutes
      setIsPlaying(false);
      onComplete(Math.min(score, 100));
    }
  }, [gameTime, score, onComplete]);

  const hitBeat = (lane: number) => {
    const now = Date.now();
    const tolerance = 200; // ms tolerance for hitting beats
    
    const nearbyBeat = beats.find(beat => 
      beat.lane === lane && 
      !beat.hit && 
      Math.abs(now - beat.timing) < tolerance
    );

    if (nearbyBeat) {
      setBeats(prev => prev.map(beat => 
        beat.id === nearbyBeat.id ? { ...beat, hit: true } : beat
      ));
      
      const accuracy = Math.max(0, tolerance - Math.abs(now - nearbyBeat.timing));
      const points = Math.round((accuracy / tolerance) * 10) + combo;
      
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
    } else {
      setCombo(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setBeats([]);
    setScore(0);
    setCombo(0);
    setGameTime(0);
  };

  const laneColors = [
    'from-red-400 to-red-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Rhythm Tapping</h2>
          <p className="text-gray-600">Tap to the beat and boost your energy</p>
        </div>

        {/* Score Display */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{combo}x</div>
              <div className="text-sm text-gray-600">Combo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{Math.floor(gameTime / 1000)}s</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="relative h-96 bg-gray-900 rounded-xl overflow-hidden">
            {/* Lanes */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: lanes }).map((_, laneIndex) => (
                <div
                  key={laneIndex}
                  className="flex-1 border-r border-gray-700 last:border-r-0 relative"
                >
                  {/* Hit Zone */}
                  <div className="absolute bottom-4 left-2 right-2 h-16 bg-white/20 rounded-lg border-2 border-white/40" />
                  
                  {/* Beats in this lane */}
                  <AnimatePresence>
                    {beats
                      .filter(beat => beat.lane === laneIndex && !beat.hit)
                      .map(beat => {
                        const progress = Math.max(0, Math.min(1, (Date.now() - beat.timing + 3000) / 3000));
                        return (
                          <motion.div
                            key={beat.id}
                            className={`absolute left-2 right-2 h-12 bg-gradient-to-r ${laneColors[laneIndex]} rounded-lg shadow-lg`}
                            style={{
                              top: `${progress * 100}%`,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                          />
                        );
                      })}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Tap Buttons */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {Array.from({ length: lanes }).map((_, laneIndex) => (
                <motion.button
                  key={laneIndex}
                  className={`flex-1 h-20 bg-gradient-to-t ${laneColors[laneIndex]} border-r border-gray-700 last:border-r-0 flex items-center justify-center text-white font-bold text-xl`}
                  onClick={() => hitBeat(laneIndex)}
                  whileTap={{ scale: 0.95, brightness: 1.2 }}
                >
                  TAP
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <motion.button
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-medium flex items-center space-x-2"
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </motion.button>

          <motion.button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-medium flex items-center space-x-2"
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </motion.button>

          <motion.button
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-medium flex items-center space-x-2"
            onClick={() => onComplete(Math.min(score, 100))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Volume2 className="w-5 h-5" />
            <span>Finish</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};