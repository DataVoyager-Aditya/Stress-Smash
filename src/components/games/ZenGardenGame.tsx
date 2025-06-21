import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Waves, Heart } from 'lucide-react';

interface ZenGardenGameProps {
  onComplete: (score: number) => void;
}

export const ZenGardenGame: React.FC<ZenGardenGameProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [currentPattern, setCurrentPattern] = useState('waves');
  const [timeSpent, setTimeSpent] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);

  const patternTypes = [
    { id: 'waves', name: 'Waves', icon: '🌊', description: 'Flowing wave patterns' },
    { id: 'circles', name: 'Circles', icon: '⭕', description: 'Concentric circles' },
    { id: 'lines', name: 'Lines', icon: '📏', description: 'Parallel lines' },
    { id: 'spirals', name: 'Spirals', icon: '🌀', description: 'Spiral patterns' }
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
    context.fillStyle = '#f5f5dc'; // Beige sand color
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add sand texture
    for (let i = 0; i < 1000; i++) {
      context.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.1})`;
      context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    setStrokeCount(prev => prev + 1);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.strokeStyle = '#8B4513';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    switch (currentPattern) {
      case 'waves':
        drawWavePattern(context, x, y);
        break;
      case 'circles':
        drawCirclePattern(context, x, y);
        break;
      case 'lines':
        drawLinePattern(context, x, y);
        break;
      case 'spirals':
        drawSpiralPattern(context, x, y);
        break;
      default:
        context.lineTo(x, y);
        context.stroke();
    }
  };

  const drawWavePattern = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.beginPath();
    for (let i = -20; i <= 20; i += 2) {
      const waveX = x + i;
      const waveY = y + Math.sin(i * 0.3) * 5;
      if (i === -20) {
        context.moveTo(waveX, waveY);
      } else {
        context.lineTo(waveX, waveY);
      }
    }
    context.stroke();
  };

  const drawCirclePattern = (context: CanvasRenderingContext2D, x: number, y: number) => {
    for (let radius = 5; radius <= 25; radius += 5) {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.stroke();
    }
  };

  const drawLinePattern = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.beginPath();
    for (let i = -30; i <= 30; i += 6) {
      context.moveTo(x + i, y - 15);
      context.lineTo(x + i, y + 15);
    }
    context.stroke();
  };

  const drawSpiralPattern = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.beginPath();
    let angle = 0;
    let radius = 0;
    context.moveTo(x, y);
    
    for (let i = 0; i < 50; i++) {
      angle += 0.3;
      radius += 0.5;
      const spiralX = x + Math.cos(angle) * radius;
      const spiralY = y + Math.sin(angle) * radius;
      context.lineTo(spiralX, spiralY);
    }
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearGarden = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Reset to sand background
    context.fillStyle = '#f5f5dc';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add sand texture
    for (let i = 0; i < 1000; i++) {
      context.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.1})`;
      context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    setStrokeCount(0);
  };

  const finishSession = () => {
    const score = Math.min(Math.round((strokeCount * 2) + (timeSpent / 60) * 10), 100);
    onComplete(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Zen Garden</h2>
          <p className="text-gray-600">Create peaceful patterns in the sand for meditation</p>
        </div>

        {/* Pattern Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Waves className="w-5 h-5 mr-2" />
            Choose Your Pattern
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {patternTypes.map((pattern) => (
              <motion.button
                key={pattern.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentPattern === pattern.id 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentPattern(pattern.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl mb-2">{pattern.icon}</div>
                <div className="font-medium text-gray-800">{pattern.name}</div>
                <div className="text-xs text-gray-600">{pattern.description}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Zen Garden Canvas */}
        <div className="bg-amber-200 rounded-2xl shadow-2xl p-4 mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border-4 border-amber-800 rounded-xl cursor-crosshair bg-yellow-100"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Stats and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time Spent:</span>
                <span className="font-bold">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Patterns Created:</span>
                <span className="font-bold">{strokeCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Tool:</span>
                <span className="font-bold capitalize">{currentPattern}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Controls</h3>
            <div className="space-y-3">
              <motion.button
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                onClick={clearGarden}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Garden</span>
              </motion.button>
              
              <motion.button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                onClick={finishSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-4 h-4" />
                <span>Complete Session</span>
              </motion.button>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">🖱️ <strong>How to use:</strong></p>
              <ul className="space-y-1 text-xs">
                <li>• Click and drag to create patterns</li>
                <li>• Choose different pattern types above</li>
                <li>• Focus on the movement for meditation</li>
                <li>• Let your mind find peace in repetition</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};