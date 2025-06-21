import { Game } from '../types';

export const games: Game[] = [
  // Breathing & Relaxation Games
  {
    id: 'breathing',
    name: 'Guided Breathing',
    description: 'Follow the breathing circle to calm your mind',
    icon: '🫁',
    suitableForMoods: ['anxious', 'stressed', 'frustrated'],
    category: 'breathing'
  },
  {
    id: 'meditation-garden',
    name: 'Meditation Garden',
    description: 'Tend to a peaceful virtual garden while meditating',
    icon: '🌸',
    suitableForMoods: ['anxious', 'stressed', 'content'],
    category: 'breathing'
  },

  // Interactive & Action Games
  {
    id: 'bubble-pop',
    name: 'Bubble Pop',
    description: 'Pop bubbles to release tension and stress',
    icon: '🫧',
    suitableForMoods: ['stressed', 'frustrated', 'anxious'],
    category: 'interactive'
  },
  {
    id: 'anger-smash',
    name: 'Anger Smash',
    description: 'Smash virtual objects to release frustration safely',
    icon: '💥',
    suitableForMoods: ['frustrated', 'stressed'],
    category: 'interactive'
  },
  {
    id: 'stress-squeeze',
    name: 'Stress Squeeze',
    description: 'Squeeze and stretch virtual stress balls',
    icon: '🏀',
    suitableForMoods: ['stressed', 'frustrated', 'anxious'],
    category: 'interactive'
  },

  // Creative & Expression Games
  {
    id: 'draw-pad',
    name: 'Mindful Drawing',
    description: 'Express yourself through colors and shapes',
    icon: '🎨',
    suitableForMoods: ['sad', 'neutral', 'content'],
    category: 'creative'
  },
  {
    id: 'color-therapy',
    name: 'Color Therapy',
    description: 'Paint with healing colors to boost your mood',
    icon: '🌈',
    suitableForMoods: ['sad', 'tired', 'neutral'],
    category: 'creative'
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Create patterns in sand for meditation',
    icon: '🏔️',
    suitableForMoods: ['content', 'neutral', 'tired'],
    category: 'creative'
  },

  // Rhythmic & Energy Games
  {
    id: 'rhythm-tap',
    name: 'Rhythm Tapping',
    description: 'Tap to the beat and boost your energy',
    icon: '🥁',
    suitableForMoods: ['tired', 'sad', 'neutral'],
    category: 'rhythmic'
  },
  {
    id: 'dance-therapy',
    name: 'Dance Therapy',
    description: 'Move your body to uplifting rhythms',
    icon: '💃',
    suitableForMoods: ['sad', 'tired', 'neutral'],
    category: 'rhythmic'
  },
  {
    id: 'energy-bounce',
    name: 'Energy Bounce',
    description: 'Bounce balls to energizing beats',
    icon: '⚡',
    suitableForMoods: ['tired', 'sad'],
    category: 'rhythmic'
  },

  // Cognitive & Mindfulness Games
  {
    id: 'word-flow',
    name: 'Positive Word Flow',
    description: 'Connect positive words to shift your mindset',
    icon: '💭',
    suitableForMoods: ['sad', 'anxious', 'frustrated'],
    category: 'cognitive'
  },
  {
    id: 'gratitude-tree',
    name: 'Gratitude Tree',
    description: 'Grow a tree by adding things you\'re grateful for',
    icon: '🌳',
    suitableForMoods: ['sad', 'neutral', 'content'],
    category: 'cognitive'
  },
  {
    id: 'mindful-maze',
    name: 'Mindful Maze',
    description: 'Navigate peaceful mazes with focused attention',
    icon: '🧩',
    suitableForMoods: ['anxious', 'neutral', 'content'],
    category: 'cognitive'
  },

  // Social & Connection Games
  {
    id: 'virtual-hug',
    name: 'Virtual Hug',
    description: 'Send and receive comforting virtual hugs',
    icon: '🤗',
    suitableForMoods: ['sad', 'tired', 'anxious'],
    category: 'social'
  },
  {
    id: 'kindness-cards',
    name: 'Kindness Cards',
    description: 'Create and share uplifting messages',
    icon: '💌',
    suitableForMoods: ['sad', 'neutral', 'content'],
    category: 'social'
  },

  // Happy & Celebration Games
  {
    id: 'joy-burst',
    name: 'Joy Burst',
    description: 'Create colorful fireworks of happiness',
    icon: '🎆',
    suitableForMoods: ['happy', 'content'],
    category: 'celebration'
  },
  {
    id: 'smile-mirror',
    name: 'Smile Mirror',
    description: 'Practice smiling and positive expressions',
    icon: '😊',
    suitableForMoods: ['happy', 'content', 'neutral'],
    category: 'celebration'
  }
];