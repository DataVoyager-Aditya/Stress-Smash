import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles, MessageCircle, X, Volume2, VolumeX } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface MascotProps {
  userLevel: number;
  currentMood?: string;
  recentScore?: number;
  isVisible: boolean;
  onToggle: () => void;
}

interface MascotState {
  expression: string;
  message: string;
  animation: string;
  color: string;
  dogBreed: string;
}

interface MascotProgress {
  level: number;
  experience: number;
  unlockedBreeds: string[];
  totalInteractions: number;
  favoriteMessages: string[];
}

export const WellnessMascot: React.FC<MascotProps> = ({
  userLevel,
  currentMood,
  recentScore,
  isVisible,
  onToggle
}) => {
  const [mascotState, setMascotState] = useState<MascotState>({
    expression: '😊',
    message: "Woof! I'm your wellness buddy!",
    animation: 'bounce',
    color: 'from-amber-400 to-orange-400',
    dogBreed: '🐕'
  });

  const [showMessage, setShowMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [mascotProgress, setMascotProgress] = useLocalStorage<MascotProgress>('mascot-progress', {
    level: 1,
    experience: 0,
    unlockedBreeds: ['🐕'],
    totalInteractions: 0,
    favoriteMessages: []
  });

  const sounds = useSoundEffects();

  // Dog breeds that unlock with levels
  const dogBreeds = {
    1: ['🐕'], // Generic dog
    2: ['🐕', '🐶'], // Puppy
    3: ['🐕', '🐶', '🦮'], // Guide dog
    4: ['🐕', '🐶', '🦮', '🐕‍🦺'], // Service dog
    5: ['🐕', '🐶', '🦮', '🐕‍🦺', '🐩'], // Poodle
    6: ['🐕', '🐶', '🦮', '🐕‍🦺', '🐩', '🐺'], // Wolf (special)
  };

  // Dog expressions for different moods
  const dogExpressions = {
    happy: ['😄', '😊', '🥳', '😍'],
    excited: ['🤩', '😆', '🎉', '⭐'],
    calm: ['😌', '😇', '🧘‍♂️', '💙'],
    supportive: ['🤗', '💪', '❤️', '🌟'],
    playful: ['😜', '🤪', '🎾', '🦴'],
    sleepy: ['😴', '💤', '🌙', '⭐']
  };

  // Mood-responsive messages with dog personality
  const dogMessages = {
    anxious: [
      "Woof! I can sense you're worried. Let's take some deep breaths together! 🐕💨",
      "Hey buddy, anxiety is like a squirrel - loud but not dangerous! You've got this! 🐿️",
      "I'm right here with you! Dogs know that staying present helps with worry! 🐾",
      "Your anxiety shows you care! Let's channel that energy into something pawsitive! ⚡"
    ],
    stressed: [
      "Ruff day? I get it! Even us dogs need to shake off the stress sometimes! 🐕‍🦺",
      "Stress is like when I see the mailman - intense but temporary! Let's relax! 📮",
      "Time for a mental walk! I'll guide you to calmer thoughts! 🦮",
      "You're working so hard! Even working dogs need breaks - let's rest! 💤"
    ],
    frustrated: [
      "Grr! I feel that frustration too! Sometimes we need to bark it out! 🗣️",
      "Frustration is like when my ball gets stuck - we just need a new approach! 🎾",
      "I see that fire in you! Let's turn that energy into something tail-waggingly good! 🔥",
      "Even the goodest dogs get frustrated! It means you care deeply! ❤️"
    ],
    sad: [
      "Aww, I can feel your sadness. Sometimes we all need a good cuddle! 🤗",
      "Sad puppy eyes? I understand. Let me sit with you for a while! 🐶",
      "Even on rainy days, dogs know the sun will come out again! 🌦️",
      "Your feelings are valid! I'm here to be your loyal companion! 💙"
    ],
    tired: [
      "Sleepy human? Time for a power nap! Even energetic dogs need rest! 😴",
      "You've been working like a sled dog! Time to curl up and recharge! 🛷",
      "Tired is just your body asking for what it needs - listen to it! 🦻",
      "Let's find a cozy spot and rest together! Zzz... 💤"
    ],
    neutral: [
      "Balanced energy! You're like a well-trained therapy dog - steady and calm! 🦮",
      "This peaceful moment reminds me of a quiet morning walk! 🌅",
      "Neutral is pawsome! It means you're ready for whatever comes next! 🐾",
      "Calm and centered - that's the energy of a wise old dog! 🧓🐕"
    ],
    content: [
      "Your contentment makes my tail wag! This is the good life! 🐕",
      "You're glowing with happiness! Like a dog in a field of tennis balls! 🎾",
      "This peaceful energy is contagious! I'm feeling zen too! 🧘‍♂️",
      "Content and happy - you're living your best life! 🌟"
    ],
    happy: [
      "WOOF WOOF! Your joy is making me do zoomies! 🏃‍♂️💨",
      "Happy human = happy dog! Your smile is my favorite treat! 😊",
      "This energy is PAWSOME! You're radiating pure sunshine! ☀️",
      "Joy level: Golden Retriever with a new stick! 🦴"
    ]
  };

  // Score-based encouragement with dog themes
  const scoreMessages = {
    high: [
      "AMAZING! You deserve all the treats and belly rubs! 🏆",
      "You're the goodest human! That performance was paw-some! 🐾",
      "Tail-wagging excellent! You're my hero! 🦸‍♂️",
      "That was fetch-tastic! You're absolutely incredible! ⭐"
    ],
    medium: [
      "Good job, buddy! Every step forward deserves a pat! 👏",
      "You're learning and growing - that's what good dogs do! 📚",
      "Steady progress! Like a loyal dog, you keep going! 🚶‍♂️",
      "I'm proud of your effort! Consistency is key! 🗝️"
    ],
    low: [
      "Hey, even puppies stumble while learning to walk! 🐶",
      "You showed up - that's what matters most! 💪",
      "Every dog has off days, but we keep wagging! 🐕",
      "I believe in you! Tomorrow is a new day to play! 🌅"
    ]
  };

  // Level-up messages with dog excitement
  const levelUpMessages = [
    "🎉 WOOF! Level up! I'm so excited I could chase my tail!",
    "⭐ New level! You're becoming the alpha of wellness!",
    "🚀 Level up achieved! Time for a victory lap around the yard!",
    "💎 You leveled up! I'm doing happy zoomies!",
    "👑 New level! You're the pack leader of progress!"
  ];

  // Random pep talks with dog wisdom
  const dogPepTalks = [
    "Dogs know the secret: live in the moment and wag often! 🐕",
    "Be like a dog - loyal to yourself and excited about small things! 🎾",
    "Every day is a good day when you approach it with puppy energy! 🐶",
    "Dogs don't worry about yesterday's mistakes - neither should you! 🌅",
    "You're pawsitively amazing! Keep being your authentic self! ⭐",
    "Like a dog with a favorite toy, hold onto what brings you joy! 🧸",
    "Dogs teach us: love unconditionally, especially yourself! ❤️",
    "Be curious like a puppy - there's always something new to discover! 🔍"
  ];

  // Update mascot based on user state
  useEffect(() => {
    updateMascotState();
  }, [currentMood, recentScore, userLevel]);

  // Level up detection
  useEffect(() => {
    if (userLevel > mascotProgress.level) {
      levelUp();
    }
  }, [userLevel, mascotProgress.level]);

  const updateMascotState = () => {
    let newState: Partial<MascotState> = {};
    
    // Choose dog breed based on level
    const availableBreeds = dogBreeds[Math.min(userLevel, 6) as keyof typeof dogBreeds] || dogBreeds[1];
    newState.dogBreed = availableBreeds[Math.floor(Math.random() * availableBreeds.length)];
    
    if (currentMood) {
      // Mood-specific expressions and colors
      if (currentMood === 'happy' || currentMood === 'content') {
        newState.expression = dogExpressions.happy[Math.floor(Math.random() * dogExpressions.happy.length)];
        newState.color = 'from-yellow-400 to-orange-400';
        newState.animation = 'bounce';
      } else if (currentMood === 'anxious' || currentMood === 'stressed') {
        newState.expression = dogExpressions.supportive[Math.floor(Math.random() * dogExpressions.supportive.length)];
        newState.color = 'from-blue-400 to-cyan-400';
        newState.animation = 'pulse';
      } else if (currentMood === 'sad' || currentMood === 'tired') {
        newState.expression = dogExpressions.calm[Math.floor(Math.random() * dogExpressions.calm.length)];
        newState.color = 'from-purple-400 to-pink-400';
        newState.animation = 'gentle';
      } else {
        newState.expression = dogExpressions.playful[Math.floor(Math.random() * dogExpressions.playful.length)];
        newState.color = 'from-green-400 to-emerald-400';
        newState.animation = 'float';
      }

      // Choose appropriate message
      const moodMessageArray = dogMessages[currentMood as keyof typeof dogMessages] || dogPepTalks;
      newState.message = moodMessageArray[Math.floor(Math.random() * moodMessageArray.length)];
    } else if (recentScore !== undefined) {
      // Score-based response
      let scoreCategory: 'high' | 'medium' | 'low' = 'medium';
      if (recentScore >= 80) scoreCategory = 'high';
      else if (recentScore < 50) scoreCategory = 'low';

      const scoreMessageArray = scoreMessages[scoreCategory];
      newState.message = scoreMessageArray[Math.floor(Math.random() * scoreMessageArray.length)];
      newState.expression = dogExpressions.excited[Math.floor(Math.random() * dogExpressions.excited.length)];
      
      if (scoreCategory === 'high') {
        newState.color = 'from-yellow-400 to-orange-400';
        newState.animation = 'celebrate';
      } else if (scoreCategory === 'low') {
        newState.color = 'from-purple-400 to-pink-400';
        newState.animation = 'encourage';
      }
    } else {
      // Random pep talk
      newState.message = dogPepTalks[Math.floor(Math.random() * dogPepTalks.length)];
      newState.expression = dogExpressions.playful[Math.floor(Math.random() * dogExpressions.playful.length)];
      newState.color = 'from-amber-400 to-orange-400';
      newState.animation = 'float';
    }

    setMascotState(prev => ({ ...prev, ...newState }));
  };

  const levelUp = () => {
    const newBreeds = dogBreeds[Math.min(userLevel, 6) as keyof typeof dogBreeds] || dogBreeds[1];
    
    setMascotProgress(prev => ({
      ...prev,
      level: userLevel,
      experience: prev.experience + 100,
      unlockedBreeds: newBreeds
    }));

    // Show level up animation
    setMascotState(prev => ({
      ...prev,
      expression: '🎉',
      message: levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)],
      animation: 'levelUp',
      color: 'from-yellow-400 to-orange-400'
    }));

    if (soundEnabled) {
      sounds.achievement();
    }

    setShowMessage(true);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
  };

  const handleMascotClick = () => {
    setMascotProgress(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
      experience: prev.experience + 10
    }));

    updateMascotState();
    setShowMessage(true);
    setIsAnimating(true);

    if (soundEnabled) {
      // Dog bark sound effect
      sounds.joy();
    }

    setTimeout(() => {
      setShowMessage(false);
      setIsAnimating(false);
    }, 4000);
  };

  const getAnimationVariants = () => {
    switch (mascotState.animation) {
      case 'bounce':
        return {
          animate: {
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }
        };
      case 'pulse':
        return {
          animate: {
            scale: [1, 1.15, 1],
            transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          }
        };
      case 'gentle':
        return {
          animate: {
            y: [0, -8, 0],
            transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }
        };
      case 'float':
        return {
          animate: {
            y: [0, -10, 0],
            x: [0, 3, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        };
      case 'celebrate':
        return {
          animate: {
            rotate: [0, 15, -15, 0],
            scale: [1, 1.3, 1],
            y: [0, -20, 0],
            transition: { duration: 0.6, repeat: 4 }
          }
        };
      case 'encourage':
        return {
          animate: {
            x: [0, -5, 5, 0],
            transition: { duration: 0.4, repeat: 3 }
          }
        };
      case 'levelUp':
        return {
          animate: {
            scale: [1, 1.6, 1.2, 1],
            rotate: [0, 360],
            y: [0, -25, 0],
            transition: { duration: 2.5, ease: "easeOut" }
          }
        };
      default:
        return {
          animate: {
            y: [0, -8, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
        };
    }
  };

  if (!isVisible) {
    return (
      <motion.button
        className="fixed bottom-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-full shadow-lg z-40"
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Open Wellness Dog"
      >
        <Heart className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Message Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="mb-4 max-w-xs"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 relative">
              <p className="text-sm text-gray-800 font-medium">{mascotState.message}</p>
              
              {/* Level indicator */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">Level {mascotProgress.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-gray-600">{mascotProgress.experience} XP</span>
                </div>
              </div>

              {/* Speech bubble tail */}
              <div className="absolute bottom-0 left-6 transform translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dog Mascot */}
      <div className="relative">
        <motion.div
          className={`w-16 h-16 bg-gradient-to-br ${mascotState.color} rounded-full shadow-lg cursor-pointer flex items-center justify-center text-2xl relative overflow-hidden`}
          onClick={handleMascotClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          {...getAnimationVariants()}
        >
          {/* Dog Breed */}
          <span className="relative z-10 text-3xl">{mascotState.dogBreed}</span>
          
          {/* Expression overlay */}
          <div className="absolute top-1 right-1 text-lg">
            {mascotState.expression}
          </div>
          
          {/* Sparkle effects for level ups */}
          {isAnimating && (
            <div className="absolute inset-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${15 + Math.random() * 70}%`,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    y: [0, -25],
                    x: [0, (Math.random() - 0.5) * 20],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.15,
                    repeat: 2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Level badge */}
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {mascotProgress.level}
          </div>
        </motion.div>

        {/* Controls */}
        <div className="absolute -top-2 -right-2 flex flex-col space-y-1">
          <motion.button
            className="bg-white text-gray-600 p-1 rounded-full shadow-md"
            onClick={() => setSoundEnabled(!soundEnabled)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </motion.button>
          
          <motion.button
            className="bg-white text-gray-600 p-1 rounded-full shadow-md"
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Hide wellness dog"
          >
            <X className="w-3 h-3" />
          </motion.button>
        </div>

        {/* Experience bar */}
        <div className="absolute -bottom-2 left-0 right-0 bg-gray-200 rounded-full h-1">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(mascotProgress.experience % 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};