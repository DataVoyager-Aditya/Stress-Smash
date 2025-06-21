import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Calendar, Trophy, Star, CheckCircle } from 'lucide-react';
import { GameSession, UserProgress } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface CommunityFeaturesProps {
  sessions: GameSession[];
  progress: UserProgress;
  onChallengeComplete: (challengeId: string) => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'daily' | 'weekly' | 'monthly';
  reward: string;
  completed: boolean;
  expiresAt: Date;
}

interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date | null;
  todayCompleted: boolean;
}

export const CommunityFeatures: React.FC<CommunityFeaturesProps> = ({ 
  sessions, 
  progress, 
  onChallengeComplete 
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [dailyStreak, setDailyStreak] = useState<DailyStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivity: null,
    todayCompleted: false
  });
  const [showGratitudeMini, setShowGratitudeMini] = useState(false);
  const [gratitudeEntries, setGratitudeEntries] = useState<string[]>([]);
  const [newGratitude, setNewGratitude] = useState('');
  const sounds = useSoundEffects();

  // Initialize challenges
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const initialChallenges: Challenge[] = [
      {
        id: 'daily-calm',
        title: 'Daily Calm',
        description: 'Complete 1 calming activity today',
        target: 1,
        current: 0,
        type: 'daily',
        reward: '10 Wellness Points',
        completed: false,
        expiresAt: tomorrow
      },
      {
        id: 'weekly-variety',
        title: 'Weekly Variety',
        description: 'Try 3 different types of activities this week',
        target: 3,
        current: 0,
        type: 'weekly',
        reward: 'Variety Master Badge',
        completed: false,
        expiresAt: nextWeek
      },
      {
        id: 'breathing-master',
        title: 'Breathing Master',
        description: 'Complete 5 breathing exercises',
        target: 5,
        current: 0,
        type: 'weekly',
        reward: 'Zen Master Badge',
        completed: false,
        expiresAt: nextWeek
      },
      {
        id: 'stress-warrior',
        title: 'Stress Warrior',
        description: 'Complete 10 stress relief sessions this month',
        target: 10,
        current: 0,
        type: 'monthly',
        reward: 'Stress Warrior Title',
        completed: false,
        expiresAt: nextMonth
      }
    ];

    setChallenges(initialChallenges);
  }, []);

  // Update challenge progress based on sessions
  useEffect(() => {
    setChallenges(prev => prev.map(challenge => {
      let current = 0;
      const now = new Date();
      
      switch (challenge.id) {
        case 'daily-calm':
          const todaySessions = sessions.filter(s => {
            const sessionDate = new Date(s.timestamp);
            return sessionDate.toDateString() === now.toDateString();
          });
          current = todaySessions.length;
          break;
          
        case 'weekly-variety':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const recentSessions = sessions.filter(s => new Date(s.timestamp) > weekAgo);
          const uniqueTypes = new Set(recentSessions.map(s => s.gameType));
          current = uniqueTypes.size;
          break;
          
        case 'breathing-master':
          const breathingSessions = sessions.filter(s => 
            s.gameType.toLowerCase().includes('breathing') || 
            s.gameType.toLowerCase().includes('meditation')
          );
          current = breathingSessions.length;
          break;
          
        case 'stress-warrior':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const monthSessions = sessions.filter(s => new Date(s.timestamp) > monthAgo);
          current = monthSessions.length;
          break;
          
        default:
          current = challenge.current;
      }

      const completed = current >= challenge.target;
      
      // Trigger completion sound and callback
      if (completed && !challenge.completed) {
        sounds.achievement();
        onChallengeComplete(challenge.id);
      }

      return {
        ...challenge,
        current: Math.min(current, challenge.target),
        completed
      };
    }));
  }, [sessions, sounds, onChallengeComplete]);

  // Update daily streak
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const todayCompleted = todaySessions.length > 0;
    
    // Calculate streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.timestamp);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });
      
      if (daySessions.length > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    setDailyStreak(prev => ({
      ...prev,
      currentStreak,
      longestStreak: Math.max(prev.longestStreak, currentStreak),
      todayCompleted,
      lastActivity: sessions.length > 0 ? new Date(sessions[sessions.length - 1].timestamp) : null
    }));
  }, [sessions]);

  const addGratitudeEntry = () => {
    if (newGratitude.trim()) {
      setGratitudeEntries(prev => [...prev, newGratitude.trim()]);
      setNewGratitude('');
      sounds.success();
    }
  };

  const getTimeUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return 'Expires soon';
  };

  return (
    <div className="space-y-6">
      {/* Daily Streak */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6" />
            <h3 className="text-xl font-bold">Daily Streak</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{dailyStreak.currentStreak}</div>
            <div className="text-sm opacity-90">days</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Longest Streak</div>
            <div className="font-semibold">{dailyStreak.longestStreak} days</div>
          </div>
          <div className="flex items-center space-x-2">
            {dailyStreak.todayCompleted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Today completed!</span>
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                <span className="text-sm">Complete today's activity</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Community Challenges */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-gray-800">Community Challenges</h3>
          </div>
          <div className="text-sm text-gray-600">
            {challenges.filter(c => c.completed).length} / {challenges.length} completed
          </div>
        </div>

        <div className="space-y-4">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              className={`border-2 rounded-xl p-4 transition-all ${
                challenge.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
                    {challenge.completed && <Trophy className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <p className="text-gray-600 text-sm">{challenge.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {challenge.current} / {challenge.target}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getTimeUntilExpiry(challenge.expiresAt)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <motion.div
                  className={`h-2 rounded-full ${
                    challenge.completed ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{challenge.reward}</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  challenge.type === 'daily' ? 'bg-blue-100 text-blue-800' :
                  challenge.type === 'weekly' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {challenge.type}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gratitude Mini-Game */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🙏</div>
            <h3 className="text-xl font-bold text-gray-800">Daily Gratitude</h3>
          </div>
          <motion.button
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            onClick={() => setShowGratitudeMini(!showGratitudeMini)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showGratitudeMini ? 'Hide' : 'Add Gratitude'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showGratitudeMini && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    placeholder="What are you grateful for today?"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onKeyPress={(e) => e.key === 'Enter' && addGratitudeEntry()}
                  />
                  <motion.button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium"
                    onClick={addGratitudeEntry}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add
                  </motion.button>
                </div>

                {gratitudeEntries.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">Today's Gratitude:</h4>
                    {gratitudeEntries.map((entry, index) => (
                      <motion.div
                        key={index}
                        className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-600 mt-0.5">•</span>
                          <span className="text-gray-700">{entry}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showGratitudeMini && gratitudeEntries.length > 0 && (
          <div className="text-center text-gray-600">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm">You've added {gratitudeEntries.length} gratitude {gratitudeEntries.length === 1 ? 'entry' : 'entries'} today!</p>
          </div>
        )}
      </div>
    </div>
  );
};