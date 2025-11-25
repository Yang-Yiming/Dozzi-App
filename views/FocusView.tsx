
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS, COLORS, EMOJIS, NIGHTMARE_EMOJIS } from '../constants';
import { Creature } from '../types';
import { Play, Square, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateVisualParams } from '../utils/slimeUtils';

const FocusView: React.FC = () => {
  const { addCreature, language, setActiveTab, isDevMode } = useApp();
  const t = TEXTS[language];

  const [isFocusing, setIsFocusing] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [collectedEmojis, setCollectedEmojis] = useState<string[]>([]);
  const [creatureSize, setCreatureSize] = useState(0);
  // We keep creatureColor for the pulse effect, but the actual creature uses visualParams
  const [creatureColor, setCreatureColor] = useState(COLORS[0]);
  const [showResult, setShowResult] = useState<'success' | 'fail' | null>(null);

  const intervalRef = useRef<number | null>(null);
  const hasEndedRef = useRef(false); // Prevent double-ending

  // Helper to format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startFocus = (minsOverride?: number) => {
    const mins = minsOverride || durationMinutes;
    // Update state so endFocus uses the correct duration for size calculation
    if (minsOverride) setDurationMinutes(minsOverride);
    
    hasEndedRef.current = false; // Reset the guard
    setIsFocusing(true);
    setTimeLeft(Math.floor(mins * 60));
    setCollectedEmojis([]);
    setCreatureSize(0.2);
    setCreatureColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setShowResult(null);
  };

  const giveUp = () => {
    if (!isFocusing) return;
    endFocus(false);
  };

  const endFocus = (success: boolean) => {
    // Guard against double-ending
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsFocusing(false);
    setShowResult(success ? 'success' : 'fail');

    // Generate Procedural Visuals
    // Now generate visuals for both success (dream) and failure (nightmare)
    const visualParams = generateVisualParams(60, undefined, !success);

    // Create Creature
    const newCreature: Creature = {
      id: Date.now().toString(),
      type: success ? 'dream' : 'nightmare',
      emojis: success ? (collectedEmojis.length > 0 ? collectedEmojis : ['✨']) : [NIGHTMARE_EMOJIS[Math.floor(Math.random() * NIGHTMARE_EMOJIS.length)]],
      createdAt: Date.now(),
      size: success ? 1 + (durationMinutes / 60) : 0.8, // Bigger creature for longer focus
      color: success ? creatureColor : 'bg-gray-800',
      visualParams: visualParams,
      // Random position in Brain (avoiding edges mostly)
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
    };

    addCreature(newCreature);
  };

  // Timer Logic
  useEffect(() => {
    if (isFocusing) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endFocus(true);
            return 0;
          }
          return prev - 1;
        });

        // Slowly grow creature
        setCreatureSize((prev) => Math.min(prev + 0.0005, 2.0));

        // Randomly add emojis (dream fragments)
        if (Math.random() < 0.05) { // 5% chance per second
          const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
          setCollectedEmojis(prev => [...prev.slice(-4), randomEmoji]); // Keep last 5
        }

      }, 1000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocusing, durationMinutes]);

  // Setup UI
  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
        <div className="text-6xl animate-bounce">
          {showResult === 'success' ? '✨' : '⚡'}
        </div>
        <h2 className="text-2xl font-bold text-white">
          {showResult === 'success' ? t.creatureBorn : t.nightmareBorn}
        </h2>
        <p className="text-gray-400">
          {showResult === 'success' 
            ? "Your focus has crystallized into a beautiful dream." 
            : "The interruption twisted the energy into a nightmare."}
        </p>
        <button 
          onClick={() => { setShowResult(null); setActiveTab('brain'); }}
          className="px-8 py-3 bg-dream-200 text-night-900 font-bold rounded-full hover:bg-white transition-colors"
        >
          View in Brain
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-night-900">
      {/* Background pulse during focus */}
      {isFocusing && (
        <div className={`absolute inset-0 ${creatureColor} opacity-10 animate-pulse-slow`}></div>
      )}

      {/* Creature Growing Visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {isFocusing ? (
          <motion.div
            className={`rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] ${creatureColor}`}
            style={{ width: 100, height: 100 }} // Base size, scaled by transform
            animate={{ 
              scale: creatureSize * 5, // visual scale
              rotate: [0, 10, -10, 0],
              borderRadius: ["50%", "45%", "50%", "40%", "50%"] // Blob effect
            }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
               {/* Emojis floating inside */}
               {collectedEmojis.length > 0 && (
                 <span className="text-xl animate-ping absolute">{collectedEmojis[collectedEmojis.length-1]}</span>
               )}
            </div>
          </motion.div>
        ) : (
          <div className="w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center">
             <Clock size={48} className="text-white/20" />
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-5xl font-mono font-bold text-white mb-8 z-10 drop-shadow-lg">
        {isFocusing ? formatTime(timeLeft) : `${Math.floor(durationMinutes)}:00`}
      </div>

      {/* Controls */}
      {!isFocusing ? (
        <div className="flex flex-col items-center space-y-6 z-10 w-full max-w-xs relative">
          
          {/* Dev Button - Only visible in dev mode */}
          {isDevMode && (
            <button 
              onClick={() => startFocus(5/60)}
              className="absolute -top-8 right-4 text-[10px] text-white/20 hover:text-white/50 border border-white/10 px-2 py-1 rounded transition-colors"
            >
              Dev: 5s
            </button>
          )}

          <div className="w-full px-4">
            <label className="block text-center text-gray-400 text-sm mb-2">{t.minutes}: {Math.floor(durationMinutes)}</label>
            <input 
              type="range" 
              min="20" 
              max="120" 
              step="5"
              value={Math.floor(durationMinutes)} 
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-dream-200"
            />
          </div>
          <button
            onClick={() => startFocus()}
            className="w-full py-4 bg-dream-200 hover:bg-white text-night-900 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <Play size={20} fill="currentColor" />
            <span>{t.startFocus}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={giveUp}
          className="px-8 py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full flex items-center space-x-2 z-10 transition-colors"
        >
          <Square size={16} fill="currentColor" />
          <span>{t.giveUp}</span>
        </button>
      )}
    </div>
  );
};

export default FocusView;