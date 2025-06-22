import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Heart, Star, Trophy, Target } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface BreathingGameProps {
  onComplete: (score: number) => void;
}

interface BreathingSession {
  technique: string;
  cycles: number;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  description: string;
  benefits: string[];
}

export const BreathingGame: React.FC<BreathingGameProps> = ({ onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycle, setCycle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4);
  const [selectedTechnique, setSelectedTechnique] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [stressLevel, setStressLevel] = useState(8);
  const [coherenceScore, setCoherenceScore] = useState(0);
  const [breathingQuality, setBreathingQuality] = useState<'poor' | 'good' | 'excellent'>('good');
  const [showInstructions, setShowInstructions] = useState(true);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  const sounds = useSoundEffects();
  const animationRef = useRef<number>();

  const breathingTechniques: BreathingSession[] = [
    {
      technique: "4-7-8 Relaxation",
      cycles: 8,
      inhaleTime: 4,
      holdTime: 7,
      exhaleTime: 8,
      description: "Dr. Weil's technique for deep relaxation and sleep",
      benefits: ["Reduces anxiety", "Improves sleep", "Lowers stress hormones"]
    },
    {
      technique: "Box Breathing",
      cycles: 10,
      inhaleTime: 4,
      holdTime: 4,
      exhaleTime: 4,
      description: "Navy SEAL technique for focus and calm",
      benefits: ["Enhances focus", "Reduces stress", "Improves performance"]
    },
    {
      technique: "Coherent Breathing",
      cycles: 12,
      inhaleTime: 5,
      holdTime: 0,
      exhaleTime: 5,
      description: "Heart Rate Variability optimization",
      benefits: ["Balances nervous system", "Improves HRV", "Enhances emotional regulation"]
    },
    {
      technique: "Energizing Breath",
      cycles: 6,
      inhaleTime: 3,
      holdTime: 2,
      exhaleTime: 4,
      description: "Quick technique to boost energy and alertness",
      benefits: ["Increases alertness", "Boosts energy", "Improves concentration"]
    }
  ];

  const currentTechnique = breathingTechniques[selectedTechnique];

  // Simulate physiological responses
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        // Simulate heart rate variability
        if (phase === 'inhale') {
          setHeartRate(prev => Math.max(60, prev - 1));
        } else if (phase === 'exhale') {
          setHeartRate(prev => Math.min(80, prev + 0.5));
        }

        // Reduce stress level gradually
        setStressLevel(prev => Math.max(1, prev - 0.1));

        // Calculate coherence score based on breathing consistency
        const consistency = Math.max(0, 100 - Math.abs(timeLeft - (currentTechnique.inhaleTime / 2)));
        setCoherenceScore(prev => Math.min(100, prev + consistency / 10));

        // Update breathing quality
        if (coherenceScore > 80) setBreathingQuality('excellent');
        else if (coherenceScore > 50) setBreathingQuality('good');
        else setBreathingQuality('poor');
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, phase, timeLeft, coherenceScore, currentTechnique.inhaleTime]);

  // Main breathing cycle logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && cycle < currentTechnique.cycles) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            sounds.breathe();
            
            // Phase transitions
            if (phase === 'inhale') {
              if (currentTechnique.holdTime > 0) {
                setPhase('hold');
                return currentTechnique.holdTime;
              } else {
                setPhase('exhale');
                return currentTechnique.exhaleTime;
              }
            } else if (phase === 'hold') {
              setPhase('exhale');
              return currentTechnique.exhaleTime;
            } else if (phase === 'exhale') {
              setPhase('pause');
              return 1;
            } else {
              setPhase('inhale');
              setCycle(prev => prev + 1);
              return currentTechnique.inhaleTime;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (cycle >= currentTechnique.cycles) {
      // Session completed
      completeSession();
    }

    return () => clearInterval(interval);
  }, [isActive, phase, cycle, currentTechnique, sounds]);

  const completeSession = () => {
    setIsActive(false);
    
    // Calculate final score
    const stressReduction = ((8 - stressLevel) / 7) * 40;
    const coherenceBonus = (coherenceScore / 100) * 30;
    const completionBonus = 30;
    const finalScore = Math.round(stressReduction + coherenceBonus + completionBonus);

    // Check for achievements
    const newAchievements = [];
    if (coherenceScore >= 90) newAchievements.push('Breathing Master');
    if (stressLevel <= 2) newAchievements.push('Zen State');
    if (cycle >= currentTechnique.cycles) newAchievements.push('Session Complete');
    
    setAchievements(newAchievements);
    
    if (newAchievements.length > 0) {
      sounds.achievement();
    }

    setTimeout(() => onComplete(finalScore), 2000);
  };

  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setShowInstructions(false);
      sounds.success();
    }
  };
  
  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycle(0);
    setTimeLeft(currentTechnique.inhaleTime);
    setHeartRate(72);
    setStressLevel(8);
    setCoherenceScore(0);
    setBreathingQuality('good');
    setAchievements([]);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-cyan-400';
      case 'hold': return 'from-purple-400 to-pink-400';
      case 'exhale': return 'from-green-400 to-emerald-400';
      case 'pause': return 'from-gray-400 to-slate-400';
      default: return 'from-blue-400 to-cyan-400';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In Slowly';
      case 'hold': return 'Hold Your Breath';
      case 'exhale': return 'Breathe Out Gently';
      case 'pause': return 'Brief Pause';
      default: return 'Breathe In Slowly';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 1.4;
      case 'hold': return 1.4;
      case 'exhale': return 0.7;
      case 'pause': return 0.7;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Advanced Breathing Therapy</h2>
          <p className="text-gray-600">Science-based breathing techniques for real physiological benefits</p>
        </div>

        {/* Technique Selection */}
        {!isActive && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Technique</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breathingTechniques.map((technique, index) => (
                <motion.button
                  key={index}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTechnique === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTechnique(index);
                    setTimeLeft(technique.inhaleTime);
                    reset();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-gray-800 mb-2">{technique.technique}</div>
                  <div className="text-sm text-gray-600 mb-3">{technique.description}</div>
                  <div className="text-xs text-blue-600">
                    {technique.inhaleTime}s in • {technique.holdTime > 0 ? `${technique.holdTime}s hold • ` : ''}{technique.exhaleTime}s out
                  </div>
                  <div className="mt-2">
                    {technique.benefits.map((benefit, i) => (
                      <span key={i} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Biometric Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{Math.round(heartRate)}</div>
            <div className="text-sm text-gray-600">Heart Rate</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{Math.round(stressLevel)}/10</div>
            <div className="text-sm text-gray-600">Stress Level</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{Math.round(coherenceScore)}</div>
            <div className="text-sm text-gray-600">Coherence</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold capitalize ${
              breathingQuality === 'excellent' ? 'text-green-600' :
              breathingQuality === 'good' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {breathingQuality}
            </div>
            <div className="text-sm text-gray-600">Quality</div>
          </div>
        </div>

        {/* Main Breathing Interface */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="relative mb-6">
              {/* Breathing Circle */}
              <motion.div
                className={`w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} mx-auto flex items-center justify-center shadow-2xl relative overflow-hidden`}
                animate={{
                  scale: getCircleScale(),
                }}
                transition={{
                  duration: timeLeft,
                  ease: 'easeInOut'
                }}
              >
                {/* Particle effects */}
                {isActive && (
                  <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          scale: [0.5, 1.5, 0.5],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="text-white text-center z-10">
                  <div className="text-xl font-bold mb-2">{getPhaseInstruction()}</div>
                  <div className="text-4xl font-mono">{timeLeft}</div>
                  <div className="text-sm mt-2 opacity-90">
                    Cycle {cycle + 1} of {currentTechnique.cycles}
                  </div>
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
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - (cycle / currentTechnique.cycles))}`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>

            {/* Instructions */}
            <AnimatePresence>
              {showInstructions && !isActive && (
                <motion.div
                  className="bg-blue-50 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-700 text-left space-y-1">
                    <li>• Follow the expanding and contracting circle</li>
                    <li>• Breathe in as the circle grows, out as it shrinks</li>
                    <li>• Watch your real-time biometrics improve</li>
                    <li>• Maintain steady rhythm for best results</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <motion.button
                className="bg-blue-500 text-white px-8 py-3 rounded-full shadow-lg flex items-center space-x-2 font-medium"
                onClick={toggleActive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isActive ? 'Pause' : 'Start Session'}</span>
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
          </div>
        </div>

        {/* Achievements */}
        <AnimatePresence>
          {achievements.length > 0 && (
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Trophy className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Achievements Unlocked!</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {achievements.map((achievement, index) => (
                  <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {achievement}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};