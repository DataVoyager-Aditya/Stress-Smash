import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, RotateCcw, Heart } from 'lucide-react';

interface ColorTherapyGameProps {
  onComplete: (score: number) => void;
}

export const ColorTherapyGame: React.FC<ColorTherapyGameProps> = ({ onComplete }) => {
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [paintedAreas, setPaintedAreas] = useState<{ x: number; y: number; color: string; size: number }[]>([]);
  const [currentMood, setCurrentMood] = useState('calm');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const moodColors = {
    calm: ['#74b9ff', '#0984e3', '#6c5ce7', '#a29bfe'],
    energetic: ['#fd79a8', '#e84393', '#ff7675', '#fd79a8'],
    peaceful: ['#00b894', '#00cec9', '#55a3ff', '#74b9ff'],
    joyful: ['#fdcb6e', '#f39c12', '#e17055', '#ff7675']
  };

  const moodPrompts = {
    calm: "Paint flowing water and peaceful skies",
    energetic: "Create vibrant bursts of energy",
    peaceful: "Paint a serene garden scene",
    joyful: "Express happiness with bright colors"
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isActive) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setPaintedAreas(prev => [...prev, {
      x,
      y,
      color: selectedColor,
      size: Math.random() * 30 + 20
    }]);
  };

  const changeMood = (mood: string) => {
    setCurrentMood(mood);
    setSelectedColor(moodColors[mood as keyof typeof moodColors][0]);
  };

  const clearCanvas = () => {
    setPaintedAreas([]);
  };

  const finishSession = () => {
    const score = Math.min(Math.round((timeSpent / 180) * 100), 100);
    onComplete(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Color Therapy</h2>
          <p className="text-gray-600">Paint with healing colors to boost your mood</p>
        </div>

        {/* Mood Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Mood Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.keys(moodColors).map((mood) => (
              <motion.button
                key={mood}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentMood === mood ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
                onClick={() => changeMood(mood)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex space-x-1 mb-2">
                  {moodColors[mood as keyof typeof moodColors].map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-sm font-medium capitalize">{mood}</div>
              </motion.button>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            {moodPrompts[currentMood as keyof typeof moodPrompts]}
          </p>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 mb-6">
          <div
            className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl cursor-crosshair relative overflow-hidden"
            onClick={handleCanvasClick}
          >
            {paintedAreas.map((area, index) => (
              <motion.div
                key={index}
                className="absolute rounded-full opacity-70"
                style={{
                  left: area.x - area.size / 2,
                  top: area.y - area.size / 2,
                  width: area.size,
                  height: area.size,
                  backgroundColor: area.color,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.7 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-gray-600 mr-2" />
            <span className="font-semibold text-gray-800">Color Palette</span>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {moodColors[currentMood as keyof typeof moodColors].map((color, index) => (
              <motion.button
                key={index}
                className={`w-12 h-12 rounded-full border-4 ${
                  selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
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
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              <motion.button
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-medium flex items-center space-x-2"
                onClick={finishSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-4 h-4" />
                <span>Complete</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};