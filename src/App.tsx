import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BarChart3, Home, Users, Brain, Music, Settings, Shield, Sparkles, Menu, X } from 'lucide-react';
import { MoodSelector } from './components/MoodSelector';
import { GameSelector } from './components/GameSelector';
import { BreathingGame } from './components/games/BreathingGame';
import { BubblePopGame } from './components/games/BubblePopGame';
import { DrawingPad } from './components/games/DrawingPad';
import { AngerSmashGame } from './components/games/AngerSmashGame';
import { ColorTherapyGame } from './components/games/ColorTherapyGame';
import { RhythmTapGame } from './components/games/RhythmTapGame';
import { GratitudeTreeGame } from './components/games/GratitudeTreeGame';
import { JoyBurstGame } from './components/games/JoyBurstGame';
import { MeditationGardenGame } from './components/games/MeditationGardenGame';
import { StressSqueezeGame } from './components/games/StressSqueezeGame';
import { ZenGardenGame } from './components/games/ZenGardenGame';
import { WordFlowGame } from './components/games/WordFlowGame';
import { MindfulMazeGame } from './components/games/MindfulMazeGame';
import { VirtualHugGame } from './components/games/VirtualHugGame';
import { DanceTherapyGame } from './components/games/DanceTherapyGame';
import { KindnessCardsGame } from './components/games/KindnessCardsGame';
import { EnergyBounceGame } from './components/games/EnergyBounceGame';
import { SmileMirrorGame } from './components/games/SmileMirrorGame';
import { SessionComplete } from './components/SessionComplete';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AIWellnessCoach } from './components/AIWellnessCoach';
import { CommunityFeatures } from './components/CommunityFeatures';
import { SocialConnection } from './components/SocialConnection';
import { AudioControls } from './components/AudioControls';
import { PrivacySettings } from './components/PrivacySettings';
import { WellnessMascot } from './components/WellnessMascot';
import { MoodAnalysisPanel } from './components/MoodAnalysisPanel';
import { MoodInputInterface } from './components/MoodInputInterface';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Mood, Game, GameSession, UserProgress } from './types';

type AppState = 'home' | 'mood-input' | 'mood-select' | 'game-select' | 'playing' | 'complete' | 'progress' | 'community';

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showSocialConnection, setShowSocialConnection] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showMascot, setShowMascot] = useState(true);
  const [showMoodAnalysis, setShowMoodAnalysis] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [sessions, setSessions] = useLocalStorage<GameSession[]>('stress-smash-sessions', []);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('stress-smash-progress', {
    totalSessions: 0,
    favoriteGame: '',
    averageStressReduction: 0,
    streakDays: 0,
    achievements: []
  });

  const sounds = useSoundEffects();

  // Calculate user level based on total sessions and achievements
  const calculateUserLevel = () => {
    const sessionLevel = Math.floor(userProgress.totalSessions / 5) + 1;
    const achievementBonus = userProgress.achievements.length;
    return Math.min(sessionLevel + achievementBonus, 10);
  };

  const userLevel = calculateUserLevel();

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setAppState('game-select');
    sounds.success();
  };

  const handleMoodAnalyzed = (mood: Mood) => {
    setSelectedMood(mood);
    setAppState('game-select');
    sounds.success();
  };

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setAppState('playing');
    sounds.tap();
  };

  const handleGameComplete = (score: number) => {
    setCurrentScore(score);
    
    if (selectedMood && selectedGame) {
      const newSession: GameSession = {
        id: Date.now().toString(),
        mood: selectedMood,
        gameType: selectedGame.name,
        duration: 5, // Default duration
        score,
        timestamp: new Date(),
        effectiveness: score
      };

      setSessions(prev => [...prev, newSession]);
      setUserProgress(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        favoriteGame: selectedGame.name,
        averageStressReduction: Math.round((prev.averageStressReduction + score) / 2)
      }));

      // Show AI coach if stress remains high
      if (selectedMood.intensity >= 7 && score < 60) {
        setTimeout(() => setShowAICoach(true), 2000);
      }
    }
    
    setAppState('complete');
    sounds.achievement();
  };

  const resetToHome = () => {
    setSelectedMood(null);
    setSelectedGame(null);
    setCurrentScore(0);
    setAppState('home');
    setShowMobileMenu(false);
    sounds.tap();
  };

  const handleChallengeComplete = (challengeId: string) => {
    setUserProgress(prev => ({
      ...prev,
      achievements: [...prev.achievements, challengeId]
    }));
  };

  const getCurrentStressLevel = () => {
    if (!selectedMood) return 3;
    return selectedMood.intensity;
  };

  const startAIJourney = () => {
    setAppState('mood-input');
    sounds.notification();
  };

  const navigateTo = (state: AppState) => {
    setAppState(state);
    setShowMobileMenu(false);
    sounds.tap();
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    switch (selectedGame.id) {
      case 'breathing':
        return <BreathingGame onComplete={handleGameComplete} />;
      case 'bubble-pop':
        return <BubblePopGame onComplete={handleGameComplete} />;
      case 'draw-pad':
        return <DrawingPad onComplete={handleGameComplete} />;
      case 'anger-smash':
        return <AngerSmashGame onComplete={handleGameComplete} />;
      case 'color-therapy':
        return <ColorTherapyGame onComplete={handleGameComplete} />;
      case 'rhythm-tap':
        return <RhythmTapGame onComplete={handleGameComplete} />;
      case 'gratitude-tree':
        return <GratitudeTreeGame onComplete={handleGameComplete} />;
      case 'joy-burst':
        return <JoyBurstGame onComplete={handleGameComplete} />;
      case 'meditation-garden':
        return <MeditationGardenGame onComplete={handleGameComplete} />;
      case 'stress-squeeze':
        return <StressSqueezeGame onComplete={handleGameComplete} />;
      case 'zen-garden':
        return <ZenGardenGame onComplete={handleGameComplete} />;
      case 'word-flow':
        return <WordFlowGame onComplete={handleGameComplete} />;
      case 'mindful-maze':
        return <MindfulMazeGame onComplete={handleGameComplete} />;
      case 'virtual-hug':
        return <VirtualHugGame onComplete={handleGameComplete} />;
      case 'dance-therapy':
        return <DanceTherapyGame onComplete={handleGameComplete} />;
      case 'kindness-cards':
        return <KindnessCardsGame onComplete={handleGameComplete} />;
      case 'energy-bounce':
        return <EnergyBounceGame onComplete={handleGameComplete} />;
      case 'smile-mirror':
        return <SmileMirrorGame onComplete={handleGameComplete} />;
      default:
        return <BreathingGame onComplete={handleGameComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Navigation - Mobile-first responsive design */}
      {appState !== 'playing' && appState !== 'mood-input' && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 safe-area-top">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
              {/* Logo - Always visible */}
              <motion.div
                className="flex items-center space-x-1 sm:space-x-2 cursor-pointer flex-shrink-0"
                onClick={resetToHome}
                whileHover={{ scale: 1.05 }}
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-pink-500" />
                <h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800">
                  StressSmash
                </h1>
              </motion.div>
              
              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                <motion.button
                  className={`px-3 lg:px-4 py-2 rounded-full flex items-center space-x-1 transition-all text-sm lg:text-base ${
                    appState === 'home' ? 'bg-pink-100 text-pink-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={resetToHome}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </motion.button>
                
                <motion.button
                  className={`px-3 lg:px-4 py-2 rounded-full flex items-center space-x-1 transition-all text-sm lg:text-base ${
                    appState === 'progress' ? 'bg-pink-100 text-pink-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setAppState('progress')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Progress</span>
                </motion.button>

                <motion.button
                  className={`px-3 lg:px-4 py-2 rounded-full flex items-center space-x-1 transition-all text-sm lg:text-base ${
                    appState === 'community' ? 'bg-pink-100 text-pink-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setAppState('community')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="w-4 h-4" />
                  <span>Community</span>
                </motion.button>

                <motion.button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 lg:px-4 py-2 rounded-full flex items-center space-x-1 transition-all text-sm lg:text-base"
                  onClick={() => setShowAICoach(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="w-4 h-4" />
                  <span>AI Coach</span>
                </motion.button>

                <motion.button
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-3 lg:px-4 py-2 rounded-full flex items-center space-x-1 transition-all text-sm lg:text-base"
                  onClick={() => setShowMoodAnalysis(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mood AI</span>
                </motion.button>

                {/* Settings Dropdown */}
                <div className="relative group">
                  <motion.button
                    className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                  
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={() => setShowSocialConnection(true)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-gray-700 text-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>Support Network</span>
                    </button>
                    
                    <button
                      onClick={() => setShowAudioControls(true)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-gray-700 text-sm"
                    >
                      <Music className="w-4 h-4" />
                      <span>Audio Controls</span>
                    </button>
                    
                    <button
                      onClick={() => setShowPrivacySettings(true)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-gray-700 rounded-b-lg text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Privacy & Control</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center space-x-2">
                {/* AI Coach - Always visible on mobile */}
                <motion.button
                  className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full"
                  onClick={() => setShowAICoach(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="AI Coach"
                >
                  <Brain className="w-4 h-4" />
                </motion.button>

                {/* Mobile Menu Button */}
                <motion.button
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                className="md:hidden bg-white border-t border-gray-200 shadow-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 py-3 space-y-1">
                  <button
                    onClick={() => navigateTo('home')}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      appState === 'home' ? 'bg-pink-100 text-pink-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Home</span>
                  </button>

                  <button
                    onClick={() => navigateTo('progress')}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      appState === 'progress' ? 'bg-pink-100 text-pink-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Progress</span>
                  </button>

                  <button
                    onClick={() => navigateTo('community')}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      appState === 'community' ? 'bg-pink-100 text-pink-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Community</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMoodAnalysis(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Mood AI</span>
                  </button>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-xs font-medium text-gray-500 px-3 py-2">Settings</div>
                    
                    <button
                      onClick={() => {
                        setShowSocialConnection(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Support Network</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowAudioControls(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Music className="w-5 h-5" />
                      <span className="font-medium">Audio Controls</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowPrivacySettings(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Privacy & Control</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}

      {/* Content - Adjusted padding for responsive header */}
      <div className={appState !== 'playing' && appState !== 'mood-input' ? 'pt-14 sm:pt-16 lg:pt-20' : ''}>
        <AnimatePresence mode="wait">
          {appState === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex items-center justify-center p-4 sm:p-6"
            >
              <div className="text-center max-w-2xl">
                <motion.div
                  className="text-6xl sm:text-8xl mb-8"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  💝
                </motion.div>
                
                <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-4">
                  Welcome to StressSmash
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-8">
                  Your AI-powered stress relief companion with a cute wellness buddy that adapts to your mood and helps you find calm through interactive activities.
                </p>
                
                <motion.button
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg font-semibold shadow-lg"
                  onClick={startAIJourney}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="w-5 h-5 mr-2 inline" />
                  Start Your AI Journey
                </motion.button>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <FeatureCard
                    icon="🎯"
                    title="AI Mood Detection"
                    description="Advanced sentiment analysis automatically detects your mood"
                  />
                  <FeatureCard
                    icon="🤖"
                    title="Smart Recommendations"
                    description="Personalized activity suggestions based on your emotional state"
                  />
                  <FeatureCard
                    icon="🐾"
                    title="Wellness Buddy"
                    description="Your cute AI dog companion that grows with your progress"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'mood-input' && (
            <motion.div
              key="mood-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MoodInputInterface
                onMoodAnalyzed={handleMoodAnalyzed}
                onBack={resetToHome}
              />
            </motion.div>
          )}

          {appState === 'mood-select' && (
            <motion.div
              key="mood-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex items-center justify-center p-4"
            >
              <MoodSelector 
                selectedMood={selectedMood} 
                onMoodSelect={handleMoodSelect} 
              />
            </motion.div>
          )}

          {appState === 'game-select' && selectedMood && (
            <motion.div
              key="game-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex items-center justify-center p-4"
            >
              <GameSelector 
                selectedMood={selectedMood} 
                onGameSelect={handleGameSelect} 
              />
            </motion.div>
          )}

          {appState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderGame()}
            </motion.div>
          )}

          {appState === 'complete' && selectedMood && selectedGame && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <SessionComplete
                mood={selectedMood}
                game={selectedGame}
                score={currentScore}
                onRestart={() => setAppState('playing')}
                onHome={resetToHome}
              />
            </motion.div>
          )}

          {appState === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProgressDashboard sessions={sessions} progress={userProgress} />
            </motion.div>
          )}

          {appState === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto p-4 sm:p-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Community & Challenges</h2>
                <p className="text-gray-600">Join challenges, track streaks, and practice gratitude</p>
              </div>
              <CommunityFeatures 
                sessions={sessions} 
                progress={userProgress}
                onChallengeComplete={handleChallengeComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wellness Dog Mascot */}
      <WellnessMascot
        userLevel={userLevel}
        currentMood={selectedMood?.name}
        recentScore={currentScore}
        isVisible={showMascot}
        onToggle={() => setShowMascot(!showMascot)}
      />

      {/* Modals and Overlays */}
      {showAICoach && (
        <AIWellnessCoach
          sessions={sessions}
          currentMood={selectedMood}
          lastScore={currentScore}
          onClose={() => setShowAICoach(false)}
        />
      )}

      {showSocialConnection && (
        <SocialConnection
          sessions={sessions}
          progress={userProgress}
          currentStressLevel={getCurrentStressLevel()}
          onClose={() => setShowSocialConnection(false)}
        />
      )}

      <AudioControls
        isVisible={showAudioControls}
        onToggleVisibility={() => setShowAudioControls(!showAudioControls)}
      />

      <PrivacySettings
        isOpen={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />

      <MoodAnalysisPanel
        isOpen={showMoodAnalysis}
        onClose={() => setShowMoodAnalysis(false)}
        currentMood={selectedMood?.name}
      />

      {/* Mobile Menu Backdrop */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
}

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <motion.div
    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

export default App;