import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Eraser, RotateCcw, Download, Brush, Sparkles, Heart, Target } from 'lucide-react';

interface DrawingPadProps {
  onComplete: (score: number) => void;
}

interface DrawingStroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
  timestamp: number;
}

interface EmotionalState {
  stress: number;
  creativity: number;
  focus: number;
  satisfaction: number;
}

export const DrawingPad: React.FC<DrawingPadProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(5);
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser'>('brush');
  const [timeSpent, setTimeSpent] = useState(0);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    stress: 8,
    creativity: 2,
    focus: 3,
    satisfaction: 2
  });
  const [drawingPrompts, setDrawingPrompts] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showColorWheel, setShowColorWheel] = useState(false);

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#000000',
    '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff'
  ];

  const therapeuticPrompts = [
    "Draw your safe place",
    "Visualize your stress leaving your body",
    "Create a pattern that represents calm",
    "Draw what happiness looks like to you",
    "Sketch your ideal day",
    "Express your current emotions through colors",
    "Draw a protective shield around yourself",
    "Create a mandala for inner peace",
    "Visualize your goals and dreams",
    "Draw something that makes you smile"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set initial styles
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      
      // Update emotional state based on drawing activity
      if (isDrawing) {
        setEmotionalState(prev => ({
          stress: Math.max(0, prev.stress - 0.05),
          creativity: Math.min(10, prev.creativity + 0.08),
          focus: Math.min(10, prev.focus + 0.06),
          satisfaction: Math.min(10, prev.satisfaction + 0.04)
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isDrawing]);

  // Generate new prompt every 2 minutes
  useEffect(() => {
    const promptTimer = setInterval(() => {
      const newPrompt = therapeuticPrompts[Math.floor(Math.random() * therapeuticPrompts.length)];
      setCurrentPrompt(newPrompt);
      setDrawingPrompts(prev => [...prev, newPrompt]);
    }, 120000);

    // Set initial prompt
    if (!currentPrompt) {
      const initialPrompt = therapeuticPrompts[Math.floor(Math.random() * therapeuticPrompts.length)];
      setCurrentPrompt(initialPrompt);
      setDrawingPrompts([initialPrompt]);
    }

    return () => clearInterval(promptTimer);
  }, [currentPrompt]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);

    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentStroke(prev => [...prev, { x, y }]);

    const context = canvas.getContext('2d');
    if (!context) return;

    if (currentTool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = brushSize * 2;
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = currentColor;
      context.lineWidth = brushSize;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Save the stroke
    const newStroke: DrawingStroke = {
      points: currentStroke,
      color: currentColor,
      size: brushSize,
      tool: currentTool,
      timestamp: Date.now()
    };
    
    setStrokes(prev => [...prev, newStroke]);
    setCurrentStroke([]);
    
    // Check for achievements
    checkAchievements();
  };

  const checkAchievements = () => {
    const newAchievements = [];
    
    if (strokes.length >= 50 && !achievements.includes('Prolific Artist')) {
      newAchievements.push('Prolific Artist');
    }
    if (timeSpent >= 300 && !achievements.includes('Dedicated Creator')) {
      newAchievements.push('Dedicated Creator');
    }
    if (emotionalState.stress <= 2 && !achievements.includes('Stress Relief Master')) {
      newAchievements.push('Stress Relief Master');
    }
    if (emotionalState.creativity >= 8 && !achievements.includes('Creative Flow')) {
      newAchievements.push('Creative Flow');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `mindful-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const finishSession = () => {
    const stressReduction = ((8 - emotionalState.stress) / 8) * 30;
    const creativityBonus = (emotionalState.creativity / 10) * 25;
    const focusBonus = (emotionalState.focus / 10) * 20;
    const timeBonus = Math.min((timeSpent / 300) * 15, 15);
    const strokeBonus = Math.min(strokes.length * 0.5, 10);
    
    const score = Math.round(stressReduction + creativityBonus + focusBonus + timeBonus + strokeBonus);
    onComplete(score);
  };

  const generateColorWheel = () => {
    const wheelColors = [];
    for (let i = 0; i < 12; i++) {
      const hue = (i * 30) % 360;
      wheelColors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return wheelColors;
  };

  const getEmotionalStateColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Therapeutic Art Studio</h2>
          <p className="text-gray-600">Express yourself through mindful drawing and creative therapy</p>
        </div>

        {/* Emotional State Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Target className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getEmotionalStateColor(10 - emotionalState.stress)}`}>
              {Math.round(emotionalState.stress)}/10
            </div>
            <div className="text-sm text-gray-600">Stress Level</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getEmotionalStateColor(emotionalState.creativity)}`}>
              {Math.round(emotionalState.creativity)}/10
            </div>
            <div className="text-sm text-gray-600">Creativity</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getEmotionalStateColor(emotionalState.focus)}`}>
              {Math.round(emotionalState.focus)}/10
            </div>
            <div className="text-sm text-gray-600">Focus</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getEmotionalStateColor(emotionalState.satisfaction)}`}>
              {Math.round(emotionalState.satisfaction)}/10
            </div>
            <div className="text-sm text-gray-600">Satisfaction</div>
          </div>
        </div>

        {/* Current Prompt */}
        {currentPrompt && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Creative Prompt</h3>
            <p className="text-lg">{currentPrompt}</p>
            <button
              onClick={() => {
                const newPrompt = therapeuticPrompts[Math.floor(Math.random() * therapeuticPrompts.length)];
                setCurrentPrompt(newPrompt);
              }}
              className="mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm transition-colors"
            >
              Get New Prompt
            </button>
          </div>
        )}

        {/* Canvas */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border-2 border-gray-200 rounded-xl cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Enhanced Tools */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Tool Selection */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentTool('brush')}
                className={`p-3 rounded-xl transition-all ${
                  currentTool === 'brush' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Brush className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setCurrentTool('eraser')}
                className={`p-3 rounded-xl transition-all ${
                  currentTool === 'eraser' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eraser className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{strokes.length}</div>
              <div className="text-sm text-gray-600">Strokes</div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Colors
              </span>
              <button
                onClick={() => setShowColorWheel(!showColorWheel)}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              >
                {showColorWheel ? 'Basic' : 'Color Wheel'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(showColorWheel ? generateColorWheel() : colors).map((color, index) => (
                <motion.button
                  key={index}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    currentColor === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800">Brush Size</span>
              <span className="text-gray-600">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fine</span>
              <span>Medium</span>
              <span>Thick</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-3">
              <motion.button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 font-medium"
                onClick={clearCanvas}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </motion.button>
              
              <motion.button
                className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 font-medium"
                onClick={downloadDrawing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Save</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              <motion.button
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-medium"
                onClick={finishSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Complete Session
              </motion.button>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <AnimatePresence>
          {achievements.length > 0 && (
            <motion.div
              className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Creative Achievements!</h3>
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