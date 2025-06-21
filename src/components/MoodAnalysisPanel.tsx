import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Calendar, MessageCircle, X, Sparkles, BarChart3 } from 'lucide-react';
import { HfInference } from '@huggingface/inference';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface MoodEntry {
  id: string;
  timestamp: Date;
  moodText: string;
  selectedMood: string;
  intensity: number;
  sentiment: {
    label: string;
    score: number;
  };
  aiInsight: string;
  tags: string[];
}

interface MoodAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentMood?: string;
}

interface MoodTrend {
  date: string;
  averageSentiment: number;
  moodCount: number;
  dominantMood: string;
}

export const MoodAnalysisPanel: React.FC<MoodAnalysisPanelProps> = ({
  isOpen,
  onClose,
  currentMood
}) => {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('mood-analysis-logs', []);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState('😐');
  const [intensitySlider, setIntensitySlider] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  
  const sounds = useSoundEffects();

  // Initialize HuggingFace client (using free tier)
  const hf = new HfInference(); // No API key needed for free tier

  const moodEmojis = [
    { emoji: '😢', label: 'Very Sad', value: 1 },
    { emoji: '😔', label: 'Sad', value: 2 },
    { emoji: '😕', label: 'Down', value: 3 },
    { emoji: '😐', label: 'Neutral', value: 4 },
    { emoji: '🙂', label: 'Okay', value: 5 },
    { emoji: '😊', label: 'Good', value: 6 },
    { emoji: '😄', label: 'Happy', value: 7 },
    { emoji: '😁', label: 'Very Happy', value: 8 },
    { emoji: '🤩', label: 'Ecstatic', value: 9 },
    { emoji: '🥳', label: 'Euphoric', value: 10 }
  ];

  const moodWords = [
    'anxious', 'stressed', 'overwhelmed', 'frustrated', 'angry', 'sad', 'lonely', 'tired',
    'neutral', 'calm', 'peaceful', 'content', 'hopeful', 'happy', 'excited', 'grateful',
    'energetic', 'confident', 'motivated', 'joyful', 'relaxed', 'focused'
  ];

  // Analyze sentiment using HuggingFace
  const analyzeSentiment = async (text: string) => {
    try {
      setIsAnalyzing(true);
      
      // Use the free distilbert model for sentiment analysis
      const result = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text
      });

      if (result && result.length > 0) {
        const sentiment = result[0];
        return {
          label: sentiment.label,
          score: sentiment.score
        };
      }
      
      // Fallback to simple keyword analysis
      return analyzeLocalSentiment(text);
    } catch (error) {
      console.log('Using local sentiment analysis as fallback');
      return analyzeLocalSentiment(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Local sentiment analysis fallback
  const analyzeLocalSentiment = (text: string) => {
    const positiveWords = ['happy', 'good', 'great', 'amazing', 'wonderful', 'excited', 'love', 'joy', 'peaceful', 'calm', 'grateful', 'blessed', 'confident', 'motivated', 'energetic'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'depressed', 'overwhelmed', 'tired', 'exhausted'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) {
      return { label: 'NEUTRAL', score: 0.5 };
    }
    
    const positiveRatio = positiveCount / totalSentimentWords;
    return {
      label: positiveRatio > 0.5 ? 'POSITIVE' : 'NEGATIVE',
      score: positiveRatio > 0.5 ? positiveRatio : 1 - positiveRatio
    };
  };

  // Generate AI insight based on mood and sentiment
  const generateAIInsight = (moodText: string, sentiment: any, intensity: number) => {
    const insights = {
      POSITIVE: {
        high: [
          "You're radiating positive energy! This is a wonderful state to be in. 🌟",
          "Your optimism is shining through! Keep nurturing these positive feelings. ✨",
          "What a beautiful mindset! You're creating your own sunshine. ☀️"
        ],
        medium: [
          "There's a gentle positivity in your words. You're on a good path! 🌱",
          "I sense contentment and peace in your expression. That's valuable! 🕊️",
          "Your balanced perspective is refreshing. You're finding your center. ⚖️"
        ],
        low: [
          "Even in subtle ways, you're showing resilience. That's strength! 💪",
          "There's hope in your words, even if it's quiet. That matters! 🌅",
          "You're finding small lights in the darkness. Keep looking for them! 🕯️"
        ]
      },
      NEGATIVE: {
        high: [
          "I hear that you're going through a tough time. Your feelings are valid. 🤗",
          "It takes courage to express difficult emotions. You're being brave. 💙",
          "This is a challenging moment, but it's temporary. You're stronger than you know. 🌊"
        ],
        medium: [
          "You're processing some difficult feelings. That's part of being human. 🌙",
          "I sense you're working through something. Take it one step at a time. 👣",
          "These feelings are real and important. Be gentle with yourself. 🌸"
        ],
        low: [
          "There's a subtle heaviness in your words. You don't have to carry it alone. 🤝",
          "I notice some underlying concerns. It's okay to feel uncertain sometimes. 🌫️",
          "You're being honest about your feelings. That's the first step to healing. 🌱"
        ]
      },
      NEUTRAL: {
        high: [
          "You're in a balanced state - that's actually quite powerful! ⚖️",
          "Neutrality can be a place of clarity and potential. You're centered! 🎯",
          "This calm state is perfect for reflection and planning. Use it wisely! 🧘"
        ],
        medium: [
          "You're in a steady place emotionally. That's a good foundation! 🏗️",
          "This balanced feeling can be very grounding. You're stable! 🌳",
          "Neutral doesn't mean empty - it means ready for anything! 🚀"
        ],
        low: [
          "You're in a quiet space emotionally. Sometimes that's exactly what we need. 🌌",
          "This calm moment might be your mind's way of resting. Honor that! 😴",
          "Neutral feelings are valid too. You're just being present! 🧘‍♀️"
        ]
      }
    };

    const intensityLevel = intensity <= 3 ? 'low' : intensity <= 7 ? 'medium' : 'high';
    const sentimentCategory = sentiment.label as keyof typeof insights;
    const categoryInsights = insights[sentimentCategory] || insights.NEUTRAL;
    const levelInsights = categoryInsights[intensityLevel];
    
    return levelInsights[Math.floor(Math.random() * levelInsights.length)];
  };

  // Extract mood tags from text
  const extractMoodTags = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    return moodWords.filter(mood => 
      words.some(word => word.includes(mood) || mood.includes(word))
    ).slice(0, 3); // Limit to 3 tags
  };

  // Submit mood entry
  const submitMoodEntry = async () => {
    if (!currentInput.trim()) return;

    setIsAnalyzing(true);
    sounds.notification();

    try {
      const sentiment = await analyzeSentiment(currentInput);
      const insight = generateAIInsight(currentInput, sentiment, intensitySlider);
      const tags = extractMoodTags(currentInput);

      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        moodText: currentInput.trim(),
        selectedMood: selectedMoodEmoji,
        intensity: intensitySlider,
        sentiment,
        aiInsight: insight,
        tags
      };

      setMoodEntries(prev => [newEntry, ...prev].slice(0, 100)); // Keep last 100 entries
      setAiInsight(insight);
      setCurrentInput('');
      
      sounds.success();
    } catch (error) {
      console.error('Error analyzing mood:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate mood trends
  const calculateTrends = (): MoodTrend[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayEntries = moodEntries.filter(entry => 
        entry.timestamp.toString().split('T')[0] === date
      );

      if (dayEntries.length === 0) {
        return {
          date,
          averageSentiment: 0,
          moodCount: 0,
          dominantMood: '😐'
        };
      }

      const avgSentiment = dayEntries.reduce((sum, entry) => {
        const score = entry.sentiment.label === 'POSITIVE' ? entry.sentiment.score : 
                     entry.sentiment.label === 'NEGATIVE' ? -entry.sentiment.score : 0;
        return sum + score;
      }, 0) / dayEntries.length;

      const moodCounts = dayEntries.reduce((acc, entry) => {
        acc[entry.selectedMood] = (acc[entry.selectedMood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
        moodCounts[a[0]] > moodCounts[b[0]] ? a : b
      )[0];

      return {
        date,
        averageSentiment: avgSentiment,
        moodCount: dayEntries.length,
        dominantMood
      };
    });
  };

  const trends = calculateTrends();
  const recentEntries = moodEntries.slice(0, 5);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Mood Analysis Panel</h3>
                <p className="text-sm text-gray-600">AI-powered mood tracking and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTrends(!showTrends)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  showTrends ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-1 inline" />
                Trends
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  How are you feeling?
                </h4>

                {/* Mood Emoji Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select your mood:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {moodEmojis.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => {
                          setSelectedMoodEmoji(mood.emoji);
                          setIntensitySlider(mood.value);
                        }}
                        className={`p-2 rounded-lg text-2xl transition-all ${
                          selectedMoodEmoji === mood.emoji
                            ? 'bg-purple-200 scale-110'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity: {intensitySlider}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensitySlider}
                    onChange={(e) => setIntensitySlider(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Text Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your feelings (optional):
                  </label>
                  <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="I'm feeling... because... today was..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Quick Mood Words */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick words:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {moodWords.slice(0, 12).map((word) => (
                      <button
                        key={word}
                        onClick={() => setCurrentInput(prev => 
                          prev ? `${prev} ${word}` : `I'm feeling ${word}`
                        )}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-purple-50 hover:border-purple-300 transition-colors"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={submitMoodEntry}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze Mood'
                  )}
                </motion.button>
              </div>

              {/* AI Insight */}
              {aiInsight && (
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
                    <h4 className="font-semibold text-gray-800">AI Insight</h4>
                  </div>
                  <p className="text-gray-700">{aiInsight}</p>
                </motion.div>
              )}
            </div>

            {/* Analysis & Trends Section */}
            <div className="space-y-6">
              {showTrends ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    7-Day Mood Trends
                  </h4>
                  
                  {/* Trend Chart */}
                  <div className="space-y-3">
                    {trends.map((trend, index) => (
                      <div key={trend.date} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{trend.dominantMood}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {new Date(trend.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {trend.moodCount} entries
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                trend.averageSentiment > 0.3 ? 'bg-green-500' :
                                trend.averageSentiment < -0.3 ? 'bg-red-500' : 'bg-yellow-500'
                              }`}
                              style={{ 
                                width: `${Math.abs(trend.averageSentiment) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">
                            {trend.averageSentiment > 0 ? '+' : ''}
                            {(trend.averageSentiment * 100).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {moodEntries.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Entries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-600">
                          {trends.filter(t => t.averageSentiment > 0).length}
                        </div>
                        <div className="text-sm text-gray-600">Positive Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Recent Entries
                  </h4>
                  
                  {recentEntries.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No mood entries yet</p>
                      <p className="text-sm">Start tracking your mood to see insights!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentEntries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          className="border border-gray-200 rounded-lg p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{entry.selectedMood}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  Intensity: {entry.intensity}/10
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.sentiment.label === 'POSITIVE' ? 'bg-green-100 text-green-800' :
                              entry.sentiment.label === 'NEGATIVE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.sentiment.label}
                            </div>
                          </div>
                          
                          {entry.moodText && (
                            <p className="text-sm text-gray-700 mb-2">"{entry.moodText}"</p>
                          )}
                          
                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {entry.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-sm text-blue-700 italic">{entry.aiInsight}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};