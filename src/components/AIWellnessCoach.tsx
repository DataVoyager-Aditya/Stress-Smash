import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, MessageCircle, X, Lightbulb, Shield, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { GameSession, Mood } from '../types';

interface AIWellnessCoachProps {
  sessions: GameSession[];
  currentMood: Mood | null;
  lastScore: number;
  onClose: () => void;
}

interface AIAnalysis {
  stressLevel: 'low' | 'moderate' | 'high' | 'critical';
  pattern: 'improving' | 'stable' | 'declining' | 'inconsistent';
  recommendation: 'continue' | 'adjust' | 'seek-help' | 'take-break';
  confidence: number;
  insights: string[];
}

interface AIResponse {
  message: string;
  category: 'mental-health' | 'digital-detox' | 'wellness' | 'crisis';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  followUp: string;
}

export const AIWellnessCoach: React.FC<AIWellnessCoachProps> = ({ 
  sessions, 
  currentMood, 
  lastScore, 
  onClose 
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [responseVariant, setResponseVariant] = useState(0); // Track which variant to show

  // Advanced AI analysis engine
  const performAIAnalysis = (): AIAnalysis => {
    const recentSessions = sessions.slice(-10);
    const veryRecentSessions = sessions.slice(-3);
    
    // Stress level analysis
    const currentStressLevel = currentMood ? currentMood.intensity : 5;
    const averageRecentScore = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length 
      : 50;
    
    let stressLevel: AIAnalysis['stressLevel'] = 'moderate';
    if (currentStressLevel >= 8 || lastScore < 30) stressLevel = 'critical';
    else if (currentStressLevel >= 7 || lastScore < 50) stressLevel = 'high';
    else if (currentStressLevel <= 3 && lastScore >= 80) stressLevel = 'low';

    // Pattern analysis
    let pattern: AIAnalysis['pattern'] = 'stable';
    if (recentSessions.length >= 5) {
      const scores = recentSessions.map(s => s.score);
      const trend = scores.slice(-3).reduce((sum, score, i) => sum + score * (i + 1), 0) / 6 - 
                   scores.slice(0, 3).reduce((sum, score, i) => sum + score * (i + 1), 0) / 6;
      
      if (trend > 10) pattern = 'improving';
      else if (trend < -10) pattern = 'declining';
      else {
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageRecentScore, 2), 0) / scores.length;
        if (variance > 400) pattern = 'inconsistent';
      }
    }

    // Recommendation engine
    let recommendation: AIAnalysis['recommendation'] = 'continue';
    if (stressLevel === 'critical') recommendation = 'seek-help';
    else if (pattern === 'declining' || stressLevel === 'high') recommendation = 'adjust';
    else if (recentSessions.length >= 5 && averageRecentScore < 40) recommendation = 'take-break';

    // Generate insights
    const insights: string[] = [];
    
    if (pattern === 'improving') {
      insights.push("Your stress management skills are improving over time.");
    } else if (pattern === 'declining') {
      insights.push("I notice your stress levels have been increasing recently.");
    }

    if (recentSessions.length > 0) {
      const favoriteActivity = recentSessions.reduce((acc, session) => {
        acc[session.gameType] = (acc[session.gameType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostUsed = Object.entries(favoriteActivity).sort(([,a], [,b]) => b - a)[0];
      if (mostUsed) {
        insights.push(`${mostUsed[0]} seems to be your go-to stress relief activity.`);
      }
    }

    if (currentMood && currentMood.intensity >= 7) {
      insights.push("High stress levels detected - let's focus on immediate relief techniques.");
    }

    const confidence = Math.min(95, 60 + (recentSessions.length * 5));

    return {
      stressLevel,
      pattern,
      recommendation,
      confidence,
      insights
    };
  };

  // Generate contextual AI response with multiple variants
  const generateAIResponse = (analysis: AIAnalysis, variant: number = 0): AIResponse => {
    const timeOfDay = new Date().getHours();
    const isEvening = timeOfDay >= 18;
    const isMorning = timeOfDay < 12;
    
    let message = '';
    let category: AIResponse['category'] = 'wellness';
    let urgency: AIResponse['urgency'] = 'low';
    let actionItems: string[] = [];
    let followUp = '';

    // Multiple response variants for each scenario
    const responseVariants = {
      critical: [
        {
          message: `I'm concerned about your current stress level. You're experiencing significant distress, and it's important to address this immediately. Your wellbeing is the top priority right now.`,
          actionItems: [
            'Take 10 deep breaths right now - inhale for 4, hold for 4, exhale for 6',
            'Consider reaching out to a mental health professional today',
            'If you\'re having thoughts of self-harm, please contact emergency services',
            'Try the 5-4-3-2-1 grounding technique to center yourself'
          ],
          followUp: 'Would you like me to provide crisis resources or guide you through an immediate calming technique?'
        },
        {
          message: `Your stress levels are at a critical point, and I want you to know that seeking help is a sign of strength, not weakness. Let's focus on immediate relief and getting you the support you need.`,
          actionItems: [
            'Practice box breathing: 4 counts in, 4 hold, 4 out, 4 hold',
            'Reach out to a trusted friend or family member right now',
            'Consider calling a mental health helpline for immediate support',
            'Use cold water on your wrists or face to activate your calm response'
          ],
          followUp: 'Remember, you don\'t have to face this alone. What feels most manageable for you right now?'
        },
        {
          message: `I can see you're going through a really tough time. High stress can feel overwhelming, but there are immediate steps we can take to help you feel more grounded and safe.`,
          actionItems: [
            'Find a quiet space and focus on your breathing for 2 minutes',
            'Contact your doctor or a mental health crisis line today',
            'Try holding an ice cube or cold object to ground yourself',
            'Write down three things you can see, hear, and feel right now'
          ],
          followUp: 'Your safety and wellbeing matter. Would you like specific resources for immediate support?'
        }
      ],
      high_declining: [
        {
          message: `I've noticed your stress levels have been increasing and the usual activities aren't providing the relief they used to. This suggests we need to adjust your approach and possibly add new strategies.`,
          actionItems: [
            'Try a different type of activity - if you usually do calming exercises, try energetic ones',
            'Consider shorter, more frequent sessions throughout the day',
            'Schedule a check-in with a counselor or therapist this week',
            'Examine what external factors might be contributing to increased stress'
          ],
          followUp: 'Let\'s work together to find what works best for you right now.'
        },
        {
          message: `Your recent pattern shows that stress is building up despite your efforts. This is completely normal - sometimes we need to switch up our strategies when life throws us curveballs.`,
          actionItems: [
            'Mix up your routine with new stress-relief activities',
            'Consider talking to someone you trust about what\'s been challenging',
            'Try combining physical movement with mindfulness practices',
            'Look into whether sleep, nutrition, or exercise changes might help'
          ],
          followUp: 'Change can be good - what new approach feels most appealing to you?'
        },
        {
          message: `I see that stress has been climbing lately. Your body and mind might be telling you that it's time for a different approach or additional support beyond these activities.`,
          actionItems: [
            'Experiment with activities at different times of day',
            'Consider professional support to complement your self-care',
            'Try pairing stress relief with social connection',
            'Evaluate if major life stressors need direct attention'
          ],
          followUp: 'Sometimes we need to address the source, not just the symptoms. What feels most important to focus on?'
        }
      ],
      digital_detox: [
        {
          message: `You've been very dedicated to your wellness practice, which is commendable! However, I'm detecting signs that you might benefit from stepping away from screens and trying offline stress relief methods.`,
          actionItems: [
            'Take a 30-60 minute break from all screens',
            'Go for a walk outside, even if it\'s just around the block',
            'Try progressive muscle relaxation without any apps',
            'Practice mindful breathing while looking out a window'
          ],
          followUp: 'Sometimes the best digital wellness tool is no digital tool at all.'
        },
        {
          message: `Your commitment to wellness is impressive! But I wonder if taking a break from digital tools might actually enhance your stress relief. Nature and offline activities can be incredibly powerful.`,
          actionItems: [
            'Spend 20 minutes in nature or by a window with natural light',
            'Try journaling with pen and paper',
            'Do some gentle stretching or yoga without following a video',
            'Have a conversation with someone face-to-face or by phone'
          ],
          followUp: 'How does the idea of an "analog" wellness break sound to you?'
        },
        {
          message: `You're doing great with consistent practice! Consider that sometimes our brains need a complete break from digital stimulation to truly reset and recharge.`,
          actionItems: [
            'Create a tech-free zone in your home for 1 hour',
            'Try a creative activity like drawing, crafting, or cooking',
            'Practice meditation or breathing without any guidance',
            'Connect with pets, plants, or spend time in your garden'
          ],
          followUp: 'What offline activity used to bring you joy that you could revisit?'
        }
      ],
      improving: [
        {
          message: `Excellent progress! Your stress management skills are clearly developing. The activities you're choosing are working well for you, and your scores show consistent improvement.`,
          actionItems: [
            'Continue with your current routine - it\'s working!',
            'Consider gradually increasing session length for deeper benefits',
            'Try teaching someone else your favorite stress relief technique',
            'Set a goal to maintain this positive trend for another week'
          ],
          followUp: 'You\'re building real resilience. How does it feel to see this progress?'
        },
        {
          message: `Fantastic work! You're not just managing stress - you're actively building emotional resilience. Your consistent practice is paying off in measurable ways.`,
          actionItems: [
            'Celebrate this progress - you\'ve earned it!',
            'Consider exploring more advanced techniques now that you have a foundation',
            'Share your success with friends or family who might benefit',
            'Think about what specific strategies have been most helpful'
          ],
          followUp: 'What aspect of your progress feels most meaningful to you?'
        },
        {
          message: `Your upward trend is inspiring! You're proving to yourself that you have the power to influence your stress levels through intentional practice.`,
          actionItems: [
            'Keep doing what you\'re doing - consistency is key',
            'Consider adding variety to prevent plateaus',
            'Document what\'s working so you can return to it during tough times',
            'Think about how you might help others with what you\'ve learned'
          ],
          followUp: 'You\'re becoming your own best stress management expert. What would you tell someone just starting out?'
        }
      ],
      inconsistent: [
        {
          message: `I notice your stress relief effectiveness varies quite a bit. This is actually normal - different techniques work better on different days depending on your mood, energy, and circumstances.`,
          actionItems: [
            'Keep a brief note about what was happening before each session',
            'Try matching activities to your energy level (high energy = active games)',
            'Experiment with session timing - some people do better in morning vs evening',
            'Don\'t worry about perfect scores - consistency matters more'
          ],
          followUp: 'Let\'s help you find the right activity for the right moment.'
        },
        {
          message: `Your varied results tell an interesting story - you're learning what works when. This kind of experimentation is actually a sign of developing emotional intelligence.`,
          actionItems: [
            'Notice patterns: what works when you\'re tired vs energized?',
            'Try creating a "menu" of options for different moods',
            'Consider external factors like weather, sleep, or social interactions',
            'Remember that some days are just harder, and that\'s okay'
          ],
          followUp: 'What patterns are you starting to notice about what works when?'
        },
        {
          message: `The ups and downs in your results are completely human and normal. You're building a toolkit of strategies, and learning when to use each tool is part of the process.`,
          actionItems: [
            'Embrace the experimentation - you\'re learning about yourself',
            'Try rating your stress before and after to see patterns',
            'Consider if certain activities work better for certain types of stress',
            'Focus on the overall trend rather than individual session scores'
          ],
          followUp: 'What have you discovered about yourself through this variety of experiences?'
        }
      ]
    };

    // Critical stress response
    if (analysis.stressLevel === 'critical') {
      category = 'crisis';
      urgency = 'critical';
      const variants = responseVariants.critical;
      const selectedVariant = variants[variant % variants.length];
      message = selectedVariant.message;
      actionItems = selectedVariant.actionItems;
      followUp = selectedVariant.followUp;
    }
    // High stress with declining pattern
    else if (analysis.stressLevel === 'high' && analysis.pattern === 'declining') {
      category = 'mental-health';
      urgency = 'high';
      const variants = responseVariants.high_declining;
      const selectedVariant = variants[variant % variants.length];
      message = selectedVariant.message;
      actionItems = selectedVariant.actionItems;
      followUp = selectedVariant.followUp;
    }
    // Digital overload detection
    else if (sessions.length >= 8 && analysis.recommendation === 'take-break') {
      category = 'digital-detox';
      urgency = 'medium';
      const variants = responseVariants.digital_detox;
      const selectedVariant = variants[variant % variants.length];
      message = selectedVariant.message;
      actionItems = selectedVariant.actionItems;
      followUp = selectedVariant.followUp;
    }
    // Improving pattern - positive reinforcement
    else if (analysis.pattern === 'improving') {
      const variants = responseVariants.improving;
      const selectedVariant = variants[variant % variants.length];
      message = selectedVariant.message;
      actionItems = selectedVariant.actionItems;
      followUp = selectedVariant.followUp;
    }
    // Inconsistent pattern
    else if (analysis.pattern === 'inconsistent') {
      const variants = responseVariants.inconsistent;
      const selectedVariant = variants[variant % variants.length];
      message = selectedVariant.message;
      actionItems = selectedVariant.actionItems;
      followUp = selectedVariant.followUp;
    }
    // Default wellness advice
    else {
      const defaultVariants = [
        {
          message: `You're doing well with your stress management practice. Consistency is key to building lasting resilience and emotional well-being.`,
          actionItems: [
            'Continue your regular practice',
            'Try to establish a routine that works for your schedule',
            'Pay attention to which activities feel most helpful',
            'Consider gradually increasing session frequency'
          ],
          followUp: 'What feels most sustainable for your lifestyle?'
        },
        {
          message: `Your approach to stress management shows good self-awareness. Building these skills takes time, and you're on the right track.`,
          actionItems: [
            'Focus on progress, not perfection',
            'Experiment with different activities to find your favorites',
            'Notice how you feel before and after sessions',
            'Be patient with yourself as you develop these skills'
          ],
          followUp: 'What motivates you most to continue this practice?'
        },
        {
          message: `You're developing valuable life skills through this practice. Stress management is like physical fitness - it requires regular attention but pays dividends.`,
          actionItems: [
            'Think of this as an investment in your future self',
            'Try to practice even when you don\'t feel like it',
            'Notice the cumulative benefits over time',
            'Consider how this practice might help in other areas of life'
          ],
          followUp: 'How has this practice started to influence other parts of your life?'
        }
      ];
      
      const selectedVariant = defaultVariants[variant % defaultVariants.length];
      message = selectedVariant.message;
      actionItems = selectedVariant.actionItems;
      followUp = selectedVariant.followUp;
    }
    
    // Evening-specific advice
    if (isEvening && category === 'wellness') {
      message += ` Since it's evening, your body is naturally preparing for rest.`;
      actionItems.push('Consider gentle, calming activities to support good sleep');
      actionItems.push('Try to finish screen-based activities at least 1 hour before bed');
    }
    
    // Morning-specific advice
    if (isMorning && category === 'wellness') {
      message += ` Starting your day with stress relief sets a positive tone.`;
      actionItems.push('Morning stress relief can improve your entire day');
      actionItems.push('Consider making this part of your daily routine');
    }

    return {
      message,
      category,
      urgency,
      actionItems,
      followUp
    };
  };

  // Simulate AI processing
  useEffect(() => {
    setIsAnalyzing(true);
    
    // Simulate AI thinking time
    const analysisTime = 1500 + Math.random() * 1000;
    
    setTimeout(() => {
      const analysis = performAIAnalysis();
      const response = generateAIResponse(analysis, responseVariant);
      
      setAiAnalysis(analysis);
      setAiResponse(response);
      setIsAnalyzing(false);
    }, analysisTime);
  }, [sessions, currentMood, lastScore, responseVariant]);

  // Function to generate different advice
  const generateDifferentAdvice = () => {
    if (!aiAnalysis) return;
    
    setIsAnalyzing(true);
    
    // Increment variant to get different advice
    const newVariant = responseVariant + 1;
    setResponseVariant(newVariant);
    
    // Simulate thinking time for new advice
    setTimeout(() => {
      const newResponse = generateAIResponse(aiAnalysis, newVariant);
      setAiResponse(newResponse);
      setIsAnalyzing(false);
    }, 800);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crisis': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'mental-health': return <Heart className="w-6 h-6 text-red-500" />;
      case 'digital-detox': return <Shield className="w-6 h-6 text-blue-500" />;
      default: return <Lightbulb className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
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
                <h3 className="text-lg font-semibold text-gray-800">AI Wellness Coach</h3>
                <p className="text-sm text-gray-600">
                  {isAnalyzing ? 'Analyzing your patterns...' : `${aiAnalysis?.confidence}% confidence`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Analysis Loading */}
          {isAnalyzing && (
            <div className="text-center py-8">
              <motion.div
                className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-600">
                {responseVariant === 0 ? 'Processing your wellness data...' : 'Generating alternative advice...'}
              </p>
            </div>
          )}

          {/* AI Response */}
          {!isAnalyzing && aiResponse && aiAnalysis && (
            <div className="space-y-6">
              {/* Urgency Indicator */}
              <div className={`border rounded-lg p-3 ${getUrgencyColor(aiResponse.urgency)}`}>
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(aiResponse.category)}
                  <span className="font-semibold capitalize">{aiResponse.category.replace('-', ' ')}</span>
                  <span className="text-sm">({aiResponse.urgency} priority)</span>
                </div>
              </div>

              {/* AI Analysis Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <h4 className="font-semibold text-gray-800">Analysis Summary</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Stress Level:</span>
                    <span className={`ml-2 font-medium ${
                      aiAnalysis.stressLevel === 'critical' ? 'text-red-600' :
                      aiAnalysis.stressLevel === 'high' ? 'text-orange-600' :
                      aiAnalysis.stressLevel === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {aiAnalysis.stressLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pattern:</span>
                    <span className="ml-2 font-medium capitalize">{aiAnalysis.pattern}</span>
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">
                    {aiResponse.message}
                  </p>
                </div>
              </div>

              {/* Insights */}
              {aiAnalysis.insights.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Key Insights:</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.insights.map((insight, index) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Recommended Actions:</h4>
                <div className="space-y-2">
                  {aiResponse.actionItems.map((action, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-green-700 text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-purple-700 text-sm italic">
                  💭 {aiResponse.followUp}
                </p>
              </div>

              {/* Crisis Resources */}
              {aiResponse.category === 'crisis' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h4 className="font-semibold text-red-800">Immediate Support Resources</h4>
                  </div>
                  <div className="space-y-2 text-red-700 text-sm">
                    <p>🆘 <strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                    <p>📞 <strong>National Suicide Prevention Lifeline:</strong> 988</p>
                    <p>🚨 <strong>Emergency Services:</strong> 911</p>
                    <p>💬 <strong>Online Chat:</strong> suicidepreventionlifeline.org</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <motion.button
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  onClick={generateDifferentAdvice}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Generating...' : 'Different Advice'}
                </motion.button>
                
                <motion.button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Thank You
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};