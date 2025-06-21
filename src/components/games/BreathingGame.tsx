import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface BreathingGameProps {
  onComplete: (score: number) => void;
}

export const BreathingGame: React.FC<BreathingGameProps> = ({ onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycle, setCycle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4);
  const [totalCycles] = useState(8);
  const sounds = useSoundEffects();

  const phaseConfig = {
    inhale: { duration: 4, instruction: 'Breathe In', color: 'from-blue-400 to-cyan-400' },
    hold: { duration: 4, instruction: 'Hold', color: 'from-purple-400 to-pink-400' },
    exhale: { duration: 6, instruction: 'Breathe Out', color: 'from-green-400 to-emerald-400' }
  };

  // Start peaceful background music
  useEffect(() => {
    if (isActive) {
      sounds.startBackgroundMusic('peaceful');
    } else {
      sounds.stopBackgroundMusic();
    }
    
    return () => sounds.stopBackgroundMusic();
  }, [isActive, sounds]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && cycle < totalCycles) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Play breathing sound on phase transitions
            sounds.breathe();
            
            // Move to next phase
            if (phase === 'inhale') {
              setPhase('hold');
              return phaseConfig.hold.duration;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return phaseConfig.exhale.duration;
            } else {
              setPhase('inhale');
              setCycle((prevCycle) => prevCycle + 1);
              return phaseConfig.inhale.duration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (cycle >= totalCycles) {
      // Game completed
      sounds.stopBackgroundMusic();
      const score = Math.round(((totalCycles * 14) / 112) * 100); // Total possible time
      onComplete(score);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, cycle, totalCycles, onComplete, sounds]);

  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      sounds.success();
    }
  };
  
  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycle(0);
    setTimeLeft(4);
    sounds.stopBackgroundMusic();
  };

  const currentConfig = phaseConfig[phase];
  const progress = ((cycle * 14 + (phaseConfig[phase].duration - timeLeft)) / (totalCycles * 14)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Guided Breathing</h2>
          <p className="text-gray-600">Follow the circle and breathe with the rhythm</p>
        </div>

        {/* Breathing Circle */}
        <div className="relative mb-8">
          <motion.div
            className={`w-64 h-64 rounded-full bg-gradient-to-br ${currentConfig.color} mx-auto flex items-center justify-center shadow-2xl`}
            animate={{
              scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1,
            }}
            transition={{
              duration: currentConfig.duration,
              ease: 'easeInOut',
              repeat: 0
            }}
          >
            <div className="text-white text-center">
              <div className="text-2xl font-bold mb-2">{currentConfig.instruction}</div>
              <div className="text-4xl font-mono">{timeLeft}</div>
            </div>
          </motion.div>
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-64 h-64 mx-auto -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="4"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <motion.button
            className="bg-white text-gray-800 px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 font-medium"
            onClick={toggleActive}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </motion.button>
          
          <motion.button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 font-medium"
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </motion.button>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Cycle {cycle + 1} of {totalCycles}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};