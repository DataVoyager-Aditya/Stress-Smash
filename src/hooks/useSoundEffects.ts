import { useCallback, useRef, useEffect } from 'react';

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  // Create audio context if needed
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Audio not supported');
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

  // Play sound with multiple layers for richer effects
  const playSound = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine', volume: number = 0.3) => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio playback failed');
    }
  }, [getAudioContext]);

  const soundEffects = {
    // Enhanced bubble pop with pitch variation
    bubblePop: () => {
      const pitch = 600 + Math.random() * 400;
      playSound(pitch, 0.15, 'sine', 0.3);
      setTimeout(() => playSound(pitch * 1.5, 0.1, 'triangle', 0.2), 50);
    },
    
    // Multi-layered smash sound (removed background music)
    smash: () => {
      playSound(150, 0.3, 'square', 0.4);
      setTimeout(() => playSound(800, 0.2, 'sawtooth', 0.3), 50);
      setTimeout(() => playSound(600, 0.15, 'triangle', 0.2), 100);
      setTimeout(() => playSound(400, 0.1, 'sine', 0.15), 150);
      setTimeout(() => playSound(200, 0.4, 'square', 0.2), 200);
    },
    
    // Success sound with harmony
    success: () => {
      playSound(523, 0.2, 'sine', 0.3); // C5
      setTimeout(() => playSound(659, 0.2, 'sine', 0.25), 100); // E5
      setTimeout(() => playSound(784, 0.3, 'sine', 0.2), 200); // G5
      setTimeout(() => playSound(1047, 0.2, 'triangle', 0.15), 300); // C6
    },
    
    // Calming breathing sound
    breathe: () => playSound(220, 0.8, 'sine', 0.2),
    
    // Sharp tap sound
    tap: () => playSound(1200, 0.08, 'square', 0.25),
    
    // Squeeze sound with pressure effect
    squeeze: () => {
      playSound(300, 0.4, 'triangle', 0.3);
      setTimeout(() => playSound(250, 0.2, 'sawtooth', 0.2), 200);
    },
    
    // Drawing sound
    draw: () => playSound(800 + Math.random() * 200, 0.1, 'sine', 0.15),
    
    // Notification chime
    notification: () => {
      playSound(800, 0.1, 'sine', 0.3);
      setTimeout(() => playSound(1000, 0.1, 'sine', 0.25), 100);
      setTimeout(() => playSound(1200, 0.15, 'triangle', 0.2), 200);
    },
    
    // Achievement fanfare
    achievement: () => {
      playSound(523, 0.15, 'sine', 0.3);
      setTimeout(() => playSound(659, 0.15, 'sine', 0.3), 75);
      setTimeout(() => playSound(784, 0.15, 'sine', 0.3), 150);
      setTimeout(() => playSound(1047, 0.3, 'sine', 0.35), 225);
      setTimeout(() => playSound(1319, 0.2, 'triangle', 0.25), 400);
    },
    
    // Zen healing frequency
    zen: () => playSound(174, 2, 'sine', 0.15),
    
    // Joy burst with cascading tones
    joy: () => {
      const baseFreq = 400;
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          playSound(baseFreq + i * 100, 0.15, 'sine', 0.2);
          playSound((baseFreq + i * 100) * 1.5, 0.1, 'triangle', 0.15);
        }, i * 60);
      }
    },

    // Bounce sound for energy games
    bounce: () => {
      playSound(400, 0.2, 'square', 0.3);
      setTimeout(() => playSound(600, 0.1, 'sine', 0.2), 100);
    },

    // Whoosh sound for movement
    whoosh: () => {
      for (let i = 0; i < 10; i++) {
        setTimeout(() => playSound(200 + i * 50, 0.05, 'sawtooth', 0.1), i * 20);
      }
    },

    // Background music controls (removed - no background music)
    startBackgroundMusic: () => {
      // No background music
    },
    stopBackgroundMusic: () => {
      // No background music
    }
  };

  return soundEffects;
};