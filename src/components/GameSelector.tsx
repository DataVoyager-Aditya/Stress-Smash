import React from 'react';
import { motion } from 'framer-motion';
import { Game, Mood } from '../types';
import { games } from '../data/games';
import { Play } from 'lucide-react';

interface GameSelectorProps {
  selectedMood: Mood;
  onGameSelect: (game: Game) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ selectedMood, onGameSelect }) => {
  const recommendedGames = games.filter(game => 
    game.suitableForMoods.includes(selectedMood.id)
  );
  
  const otherGames = games.filter(game => 
    !game.suitableForMoods.includes(selectedMood.id)
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Perfect activities for when you're feeling {selectedMood.name.toLowerCase()}
        </h2>
        <p className="text-gray-600">Choose a stress-relief activity that matches your mood</p>
      </div>

      {recommendedGames.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="text-2xl mr-2">⭐</span>
            Recommended for you
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedGames.map((game) => (
              <GameCard key={game.id} game={game} onSelect={onGameSelect} isRecommended />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Other activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherGames.map((game) => (
            <GameCard key={game.id} game={game} onSelect={onGameSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

const GameCard: React.FC<{ game: Game; onSelect: (game: Game) => void; isRecommended?: boolean }> = ({ 
  game, 
  onSelect, 
  isRecommended = false 
}) => (
  <motion.div
    className={`
      bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 relative overflow-hidden
      ${isRecommended 
        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' 
        : 'border-gray-200 hover:border-gray-300'
      }
    `}
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(game)}
  >
    <div className="text-center">
      <div className="text-5xl mb-4">{game.icon}</div>
      <h4 className="text-xl font-semibold text-gray-800 mb-2">{game.name}</h4>
      <p className="text-gray-600 mb-4">{game.description}</p>
      
      <motion.button
        className={`
          inline-flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300
          ${isRecommended
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Play className="w-4 h-4 mr-2" />
        Start Activity
      </motion.button>
    </div>
    
    {isRecommended && (
      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
        Recommended
      </div>
    )}
  </motion.div>
);