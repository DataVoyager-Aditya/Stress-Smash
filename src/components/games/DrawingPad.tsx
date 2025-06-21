import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Eraser, RotateCcw, Download } from 'lucide-react';

interface DrawingPadProps {
  onComplete: (score: number) => void;
}

export const DrawingPad: React.FC<DrawingPadProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(3);
  const [timeSpent, setTimeSpent] = useState(0);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#eab308'
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
    context.strokeStyle = currentColor;
    context.lineWidth = brushSize;
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

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const changeColor = (color: string) => {
    setCurrentColor(color);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.strokeStyle = color;
  };

  const changeBrushSize = (size: number) => {
    setBrushSize(size);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineWidth = size;
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-mindful-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const finishSession = () => {
    const score = Math.min(Math.round((timeSpent / 300) * 100), 100); // Max 5 minutes for full score
    onComplete(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Mindful Drawing</h2>
          <p className="text-gray-600">Express yourself through colors and shapes</p>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border border-gray-200 rounded-xl cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Tools */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Color Palette */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Palette className="w-5 h-5 text-gray-600 mr-2" />
              <span className="font-semibold text-gray-800">Colors</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  className={`w-10 h-10 rounded-full border-4 ${
                    currentColor === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => changeColor(color)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className="font-semibold text-gray-800">Brush Size</span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => changeBrushSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-gray-600 w-8 text-center">{brushSize}px</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4">
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
                Finish Session
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};