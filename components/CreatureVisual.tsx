
import React, { useRef, useEffect } from 'react';
import { Creature } from '../types';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { drawSlime } from '../utils/slimeUtils';

interface CreatureVisualProps {
  creature: Creature;
  className?: string;
  onClick?: () => void;
  isScared?: boolean;
}

export const CreatureVisual: React.FC<CreatureVisualProps> = ({ creature, className = '', onClick, isScared = false }) => {
  const { creatureScale } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const timeRef = useRef<number>(Math.random() * 100);

  const isNightmare = creature.type === 'nightmare';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas resolution for crispness
    // We scale the canvas resolution by creatureScale to maintain pixel density
    // while the CSS size scales up.
    const width = 200 * creatureScale;
    const height = 200 * creatureScale;
    canvas.width = width;
    canvas.height = height;

    const animate = () => {
      // Increase animation speed when scared
      const speed = isScared ? 0.2 : 0.02;
      timeRef.current += speed;
      
      if (creature.visualParams) {
        drawSlime(ctx, creature.visualParams, timeRef.current, width, height, creatureScale);
      } else {
        // Fallback for legacy creatures without visualParams
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        
        // Scale fallback drawing
        const s = creatureScale;

        if (isNightmare) {
           // Old Legacy Nightmare Fallback
           ctx.fillStyle = '#1a1a1a';
           ctx.beginPath();
           for(let i=0; i<12; i++) {
             const a = (i/12) * Math.PI * 2 + timeRef.current;
             const r = (50 + Math.random() * 10) * s;
             ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
           }
           ctx.fill();
           
           // Red eyes
           ctx.fillStyle = '#ff0000';
           ctx.beginPath();
           ctx.arc(cx - 15 * s, cy - 10 * s, 5 * s, 0, Math.PI*2);
           ctx.arc(cx + 15 * s, cy - 10 * s, 5 * s, 0, Math.PI*2);
           ctx.fill();
        } else {
           // Fallback circle
           ctx.fillStyle = '#888888';
           ctx.beginPath();
           ctx.arc(cx, cy, 60 * s, 0, Math.PI*2);
           ctx.fill();
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [creature, isNightmare, isScared, creatureScale]);

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      animate={isScared ? { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.2, repeat: Infinity } } : {}}
    >
      <canvas 
        ref={canvasRef}
        className="image-pixelated drop-shadow-lg"
        style={{
          width: `${100 * creature.size * creatureScale}px`,
          height: `${100 * creature.size * creatureScale}px`,
        }}
      />
      
      {/* Optional: Subtle smoke/fog effect for nightmares to distinguish them further, but keep it cute */}
      {isNightmare && (
        <div className="absolute inset-0 rounded-full bg-purple-900/10 pointer-events-none mix-blend-overlay"></div>
      )}
    </motion.div>
  );
};
