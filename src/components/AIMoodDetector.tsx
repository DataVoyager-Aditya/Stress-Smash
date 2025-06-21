import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mic, MicOff, ArrowLeft, Sparkles, MessageCircle, Loader } from 'lucide-react';
import { HfInference } from '@huggingface/inference';
import { Mood } from '../types';
import { moods } from '../data/moods';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface AIMoodDetectorProps {
  onMoodDetected: (mood: Mood) => void;
  onBack: () => void;
}

interface SentimentResult {
  label: string;
  score: number;
}

export const AIMoodDetector: React.FC<AIMoodDetectorProps> = ({
  onMoodDetected,
  onBack
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  const [inputMethod, setInputMethod] = useState<'text' | 'voice'>('text');
  const [textInput, setTextInput] = useState('');
  
  const sounds = useSoundEffects();
  const hf = new HfInference();

  // Speech recognition setup
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
      sounds.notification();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const analyzeMood = async (text: string) => {
    if (!text.trim()) return;

    setStep('analyzing');
    setIsAnalyzing(true);
    sounds.notification();

    try {
      // Use HuggingFace sentiment analysis
      const sentiment = await analyzeSentiment(text);
      const mood = mapSentimentToMood(sentiment, text);
      const insight = generateInsight(text, sentiment, mood);

      setDetectedMood(mood);
      setAiInsight(insight);
      setStep('result');
      sounds.success();
    } catch (error) {
      console.error('Mood analysis error:', error);
      // Fallback to local analysis
      const localSentiment = analyzeLocalSentiment(text);
      const mood = mapSentimentToMood(localSentiment, text);
      const insight = generateInsight(text, localSentiment, mood);

      setDetectedMood(mood);
      setAiInsight(insight);
      setStep('result');
      sounds.success();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
    try {
      const result = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text
      });

      if (result && result.length > 0) {
        return {
          label: result[0].label,
          score: result[0].score
        };
      }
      
      return analyzeLocalSentiment(text);
    } catch (error) {
      return analyzeLocalSentiment(text);
    }
  };

  const analyzeLocalSentiment = (text: string): SentimentResult => {
    const stressWords = ['stressed', 'anxious', 'worried', 'overwhelmed', 'panic', 'pressure', 'tense', 'nervous'];
    const sadWords = ['sad', 'depressed', 'down', 'lonely', 'empty', 'hopeless', 'crying', 'tears'];
    const angryWords = ['angry', 'frustrated', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'pissed'];
    const happyWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'awesome'];
    const calmWords = ['calm', 'peaceful', 'relaxed', 'content', 'serene', 'tranquil', 'zen'];
    const tiredWords = ['tired', 'exhausted', 'drained', 'weary', 'sleepy', 'fatigue'];

    const words = text.toLowerCase().split(/\s+/);
    
    let stressCount = 0;
    let sadCount = 0;
    let angryCount = 0;
    let happyCount = 0;
    let calmCount = 0;
    let tiredCount = 0;

    words.forEach(word => {
      if (stressWords.some(sw => word.includes(sw))) stressCount++;
      if (sadWords.some(sw => word.includes(sw))) sadCount++;
      if (angryWords.some(aw => word.includes(aw))) angryCount++;
      if (happyWords.some(hw => word.includes(hw))) happyCount++;
      if (calmWords.some(cw => word.includes(cw))) calmCount++;
      if (tiredWords.some(tw => word.includes(tw))) tiredCount++;
    });

    // Determine dominant emotion
    const emotions = {
      stress: stressCount,
      sad: sadCount,
      angry: angryCount,
      happy: happyCount,
      calm: calmCount,
      tired: tiredCount
    };

    const dominantEmotion = Object.entries(emotions).reduce((a, b) => 
      emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b
    )[0];

    const totalEmotionalWords = Object.values(emotions).reduce((sum, count) => sum + count, 0);
    const intensity = Math.min(totalEmotionalWords / words.length * 10, 1);

    if (dominantEmotion === 'happy' || dominantEmotion === 'calm') {
      return { label: 'POSITIVE', score: 0.7 + intensity * 0.3 };
    } else if (totalEmotionalWords === 0) {
      return { label: 'NEUTRAL', score: 0.5 };
    } else {
      return { label: 'NEGATIVE', score: 0.7 + intensity * 0.3 };
    }
  };

  const mapSentimentToMood = (sentiment: SentimentResult, text: string): Mood => {
    const words = text.toLowerCase();
    
    // Check for specific mood indicators
    if (words.includes('anxious') || words.includes('panic') || words.includes('worried')) {
      return moods.find(m => m.id === 'anxious') || moods[0];
    }
    if (words.includes('stressed') || words.includes('overwhelmed') || words.includes('pressure')) {
      return moods.find(m => m.id === 'stressed') || moods[1];
    }
    if (words.includes('angry') || words.includes('frustrated') || words.includes('mad')) {
      return moods.find(m => m.id === 'frustrated') || moods[2];
    }
    if (words.includes('sad') || words.includes('depressed') || words.includes('down')) {
      return moods.find(m => m.id === 'sad') || moods[3];
    }
    if (words.includes('tired') || words.includes('exhausted') || words.includes('drained')) {
      return moods.find(m => m.id === 'tired') || moods[4];
    }
    if (words.includes('happy') || words.includes('joy') || words.includes('excited')) {
      return moods.find(m => m.id === 'happy') || moods[7];
    }
    if (words.includes('calm') || words.includes('peaceful') || words.includes('content')) {
      return moods.find(m => m.id === 'content') || moods[6];
    }

    // Fallback to sentiment-based mapping
    if (sentiment.label === 'POSITIVE') {
      return sentiment.score > 0.8 ? 
        moods.find(m => m.id === 'happy') || moods[7] :
        moods.find(m => m.id === 'content') || moods[6];
    } else if (sentiment.label === 'NEGATIVE') {
      return sentiment.score > 0.8 ?
        moods.find(m => m.id === 'anxious') || moods[0] :
        moods.find(m => m.id === 'sad') || moods[3];
    } else {
      return moods.find(m => m.id === 'neutral') || moods[5];
    }
  };

  const generateInsight = (text: string, sentiment: SentimentResult, mood: Mood): string => {
    const insights = {
      anxious: [
        "I can sense the anxiety in your words. Remember, this feeling is temporary and you have the strength to work through it. 🌟",
        "Your mind seems to be racing with worries. Let's focus on grounding techniques to bring you back to the present moment. 🌱",
        "I hear the concern in your voice. Anxiety often means you care deeply about something - let's channel that into positive action. 💪"
      ],
      stressed: [
        "You're carrying a lot right now, and that's completely understandable. Let's find ways to lighten that mental load. 🎈",
        "Stress is your body's way of saying it needs attention. You're wise to recognize it and seek relief. 🧘‍♀️",
        "I can feel the pressure you're under. Remember, you don't have to handle everything at once. 🌊"
      ],
      frustrated: [
        "That frustration is real and valid. Sometimes our emotions are signals that something needs to change. 🔥",
        "I hear the intensity in your words. Frustration often comes from caring deeply - let's redirect that energy positively. ⚡",
        "Your feelings are completely justified. Let's find healthy ways to process and release this frustration. 🌪️"
      ],
      sad: [
        "I can feel the heaviness in your heart. It's okay to sit with sadness - it's part of being human. 💙",
        "Your sadness is valid and important. Sometimes we need to feel these emotions fully before we can heal. 🌙",
        "I hear the pain in your words. You don't have to carry this alone - support is here for you. 🤗"
      ],
      tired: [
        "Your exhaustion is showing, and that's your body asking for what it needs. Rest is not a luxury, it's necessary. 😴",
        "I can sense how drained you feel. Sometimes the bravest thing we can do is rest and recharge. 🔋",
        "Fatigue is your body's wisdom speaking. Listen to it and be gentle with yourself. 🌅"
      ],
      neutral: [
        "You seem to be in a balanced space right now. This calm energy is actually quite powerful for reflection and growth. ⚖️",
        "I sense a steady, grounded energy from you. This neutral state can be perfect for making clear decisions. 🌳",
        "Your emotional balance is showing. Sometimes the most profound growth happens in these quiet moments. 🧘"
      ],
      content: [
        "There's a beautiful sense of peace in your words. This contentment is something to cherish and build upon. ✨",
        "I can feel the calm satisfaction in your energy. You're in a wonderful place for gratitude and reflection. 🌸",
        "Your inner peace is radiating through. This is the kind of energy that heals and inspires others. 🕊️"
      ],
      happy: [
        "Your joy is absolutely contagious! This positive energy is a gift to yourself and everyone around you. 🌟",
        "I can feel the happiness bubbling up in your words. This is the kind of energy that creates beautiful ripples. 🌈",
        "Your excitement and joy are wonderful to witness. You're radiating the kind of energy that lifts others up. ☀️"
      ]
    };

    const moodInsights = insights[mood.id as keyof typeof insights] || insights.neutral;
    return moodInsights[Math.floor(Math.random() * moodInsights.length)];
  };

  const handleConfirmMood = () => {
    if (detectedMood) {
      onMoodDetected(detectedMood);
    }
  };

  const handleTextAnalysis = () => {
    if (textInput.trim()) {
      analyzeMood(textInput);
    }
  };

  const handleVoiceAnalysis = () => {
    if (transcript.trim()) {
      analyzeMood(transcript);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🤖
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Mood Detection</h2>
          <p className="text-gray-600">Let me analyze how you're feeling and recommend the perfect activity</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              {/* Input Method Selection */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 rounded-full p-1 flex">
                  <button
                    onClick={() => setInputMethod('text')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      inputMethod === 'text'
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 mr-2 inline" />
                    Text
                  </button>
                  <button
                    onClick={() => setInputMethod('voice')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      inputMethod === 'voice'
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600'
                    }`}
                  >
                    <Mic className="w-4 h-4 mr-2 inline" />
                    Voice
                  </button>
                </div>
              </div>

              {inputMethod === 'text' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How are you feeling right now?
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="I'm feeling... because... today was..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={4}
                    />
                  </div>
                  <motion.button
                    onClick={handleTextAnalysis}
                    disabled={!textInput.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Brain className="w-5 h-5 mr-2 inline" />
                    Analyze My Mood
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <motion.button
                      onClick={isListening ? stopListening : startListening}
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl shadow-lg ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                      transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                    >
                      {isListening ? <MicOff /> : <Mic />}
                    </motion.button>
                    <p className="mt-4 text-gray-600">
                      {isListening ? 'Listening... Speak naturally about how you feel' : 'Click to start voice recording'}
                    </p>
                  </div>

                  {transcript && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">What I heard:</h4>
                      <p className="text-gray-700 italic">"{transcript}"</p>
                      <motion.button
                        onClick={handleVoiceAnalysis}
                        className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Brain className="w-4 h-4 mr-2 inline" />
                        Analyze This
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800 flex items-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-2xl shadow-2xl p-8 text-center"
            >
              <motion.div
                className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Your Mood...</h3>
              <p className="text-gray-600">Using advanced AI to understand your emotional state</p>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing natural language...
                </div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Detecting emotional patterns...
                </div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Brain className="w-4 h-4 mr-2" />
                  Generating personalized insights...
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && detectedMood && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{detectedMood.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  I sense you're feeling {detectedMood.name.toLowerCase()}
                </h3>
                <p className="text-gray-600">{detectedMood.description}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Insight
                </h4>
                <p className="text-gray-700">{aiInsight}</p>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  onClick={handleConfirmMood}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Yes, that's right! Continue →
                </motion.button>
                <motion.button
                  onClick={() => setStep('input')}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800 flex items-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};