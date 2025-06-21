import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award, BarChart3, Activity, Clock, Star } from 'lucide-react';
import { GameSession, UserProgress } from '../types';

interface ProgressDashboardProps {
  sessions: GameSession[];
  progress: UserProgress;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ sessions, progress }) => {
  console.log('📊 Progress Dashboard - Sessions:', sessions.length, 'Progress:', progress);

  const recentSessions = sessions.slice(-7);
  const weeklyAverage = recentSessions.length > 0 
    ? Math.round(recentSessions.reduce((sum, session) => sum + session.effectiveness, 0) / recentSessions.length)
    : 0;

  const moodDistribution = sessions.reduce((acc, session) => {
    const moodName = session.mood?.name || 'Unknown';
    acc[moodName] = (acc[moodName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonMood = Object.entries(moodDistribution).length > 0 
    ? Object.entries(moodDistribution).reduce((a, b) => 
        moodDistribution[a[0]] > moodDistribution[b[0]] ? a : b
      )?.[0] || 'None'
    : 'None';

  const achievements = [
    { 
      id: 'first-session', 
      name: 'First Steps', 
      description: 'Complete your first session', 
      unlocked: sessions.length >= 1,
      icon: '🎯'
    },
    { 
      id: 'week-streak', 
      name: 'Week Warrior', 
      description: 'Use the app for 7 days', 
      unlocked: progress.streakDays >= 7,
      icon: '🔥'
    },
    { 
      id: 'high-scorer', 
      name: 'High Scorer', 
      description: 'Score above 90%', 
      unlocked: sessions.some(s => s.score >= 90),
      icon: '🏆'
    },
    { 
      id: 'mood-master', 
      name: 'Mood Master', 
      description: 'Try all available activities', 
      unlocked: new Set(sessions.map(s => s.gameType)).size >= 4,
      icon: '🎭'
    },
    {
      id: 'consistency-champion',
      name: 'Consistency Champion',
      description: 'Complete 10 sessions',
      unlocked: sessions.length >= 10,
      icon: '⭐'
    },
    {
      id: 'wellness-warrior',
      name: 'Wellness Warrior',
      description: 'Maintain a 3-day streak',
      unlocked: progress.streakDays >= 3,
      icon: '💪'
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.length;

  // Calculate weekly progress
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const weeklyData = last7Days.map(date => {
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.timestamp).toISOString().split('T')[0];
      return sessionDate === date;
    });
    
    return {
      date,
      sessionCount: daySessions.length,
      averageScore: daySessions.length > 0 
        ? Math.round(daySessions.reduce((sum, s) => sum + s.score, 0) / daySessions.length)
        : 0,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Header - Responsive text sizes */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Your Wellness Progress</h2>
        <p className="text-sm sm:text-base text-gray-600">Track your stress relief journey and celebrate your achievements</p>
      </div>

      {/* Quick Stats Overview - Responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard
          icon={<Activity className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />}
          title="Total Sessions"
          value={progress.totalSessions.toString()}
          subtitle="Activities completed"
          color="bg-blue-500"
          trend={sessions.length > 0 ? '+' + sessions.length : ''}
        />
        <StatCard
          icon={<TrendingUp className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />}
          title="Weekly Average"
          value={`${weeklyAverage}%`}
          subtitle="Effectiveness this week"
          color="bg-emerald-500"
          trend={weeklyAverage > 70 ? 'Excellent' : weeklyAverage > 50 ? 'Good' : 'Improving'}
        />
        <StatCard
          icon={<Target className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />}
          title="Current Streak"
          value={`${progress.streakDays} days`}
          subtitle="Consecutive days"
          color="bg-purple-500"
          trend={progress.streakDays > 0 ? '🔥' : ''}
        />
        <StatCard
          icon={<Award className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />}
          title="Achievements"
          value={`${unlockedAchievements.length}/${totalAchievements}`}
          subtitle="Unlocked badges"
          color="bg-orange-500"
          trend={unlockedAchievements.length > 0 ? '🏆' : ''}
        />
      </div>

      {/* Main Content Grid - Stack on mobile, side by side on larger screens */}
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-8 mb-6 sm:mb-8">
        {/* Recent Sessions */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
            Recent Sessions
          </h3>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="text-lg sm:text-xl lg:text-2xl flex-shrink-0">{session.mood?.icon || '😐'}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-800 text-xs sm:text-sm lg:text-base truncate">
                        {session.gameType}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="hidden sm:inline">{new Date(session.timestamp).toLocaleDateString()} • </span>
                        <span className="sm:hidden">{new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • </span>
                        {session.duration}min
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-semibold text-xs sm:text-sm lg:text-base ${
                      session.score >= 80 ? 'text-green-600' :
                      session.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {session.score}%
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">effectiveness</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6 sm:py-8">
              <Activity className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="font-medium text-sm sm:text-base">No sessions yet</p>
              <p className="text-xs sm:text-sm">Complete your first activity to see progress!</p>
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Start with a simple breathing exercise or mood check-in to begin tracking your wellness journey.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
            Weekly Activity
          </h3>
          
          <div className="space-y-2 sm:space-y-3">
            {weeklyData.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 w-6 sm:w-8 flex-shrink-0">
                    {day.dayName}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3 relative overflow-hidden">
                    <motion.div
                      className={`h-2 sm:h-3 rounded-full ${
                        day.sessionCount > 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((day.sessionCount / 3) * 100, 100)}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="text-right ml-2 sm:ml-3 flex-shrink-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-800">
                    {day.sessionCount}
                    <span className="hidden sm:inline"> session{day.sessionCount !== 1 ? 's' : ''}</span>
                  </div>
                  {day.averageScore > 0 && (
                    <div className="text-xs text-gray-500">
                      {day.averageScore}%
                      <span className="hidden sm:inline"> avg</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sessions.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <p className="text-xs sm:text-sm">Complete activities to see your weekly progress chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Mood Insights - Full width responsive */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4">Mood Insights</h3>
        
        {Object.keys(moodDistribution).length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Most Common Mood - Responsive layout */}
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{mostCommonMood}</div>
              <div className="text-xs sm:text-sm text-gray-600">Most common mood</div>
            </div>

            {/* Mood Distribution - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(moodDistribution).slice(0, 6).map(([mood, count]) => (
                <div key={mood} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm sm:text-base text-gray-700 font-medium truncate">{mood}</span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="w-12 sm:w-16 lg:w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(count / sessions.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎭</div>
            <p className="font-medium text-sm sm:text-base">Complete more sessions to see mood patterns</p>
          </div>
        )}
      </div>

      {/* Achievements - Responsive grid */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked 
                  ? 'border-emerald-200 bg-emerald-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`text-xl sm:text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm sm:text-base ${
                    achievement.unlocked ? 'text-emerald-800' : 'text-gray-600'
                  } truncate`}>
                    {achievement.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{achievement.description}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  trend?: string;
}> = ({ icon, title, value, subtitle, color, trend }) => (
  <motion.div
    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className={`${color} text-white p-2 sm:p-3 rounded-lg sm:rounded-xl inline-flex mb-2 sm:mb-4`}>
      {icon}
    </div>
    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">{value}</div>
    <div className="text-gray-600 font-medium mb-1 text-xs sm:text-sm lg:text-base">{title}</div>
    <div className="text-xs sm:text-sm text-gray-500">{subtitle}</div>
    {trend && (
      <div className="text-xs text-purple-600 font-medium mt-1">{trend}</div>
    )}
  </motion.div>
);