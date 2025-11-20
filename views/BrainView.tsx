
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CreatureVisual } from '../components/CreatureVisual';
import { TEXTS } from '../constants';
import { Creature } from '../types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Extended type for simulation state
type SimulatedCreature = Creature & { 
  isScared?: boolean;
  vx: number;
  vy: number;
};

const BrainView: React.FC = () => {
  const { creatures, language, addForumPost, updateCreatures } = useApp();
  const t = TEXTS[language];
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  
  // Sharing State
  const [isSharing, setIsSharing] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  
  // Local simulation state
  const [simulatedCreatures, setSimulatedCreatures] = useState<SimulatedCreature[]>([]);
  const requestRef = useRef<number | null>(null);
  const simulatedCreaturesRef = useRef<SimulatedCreature[]>([]);

  // Keep ref updated for unmount saving
  useEffect(() => {
    simulatedCreaturesRef.current = simulatedCreatures;
  }, [simulatedCreatures]);

  // Save positions on unmount
  useEffect(() => {
    return () => {
      if (simulatedCreaturesRef.current.length > 0) {
        const updatedCreatures = simulatedCreaturesRef.current.map(sim => {
          // Strip simulation-only props and keep updated x,y
          const { vx, vy, isScared, ...creatureData } = sim;
          return creatureData as Creature;
        });
        updateCreatures(updatedCreatures);
      }
    };
  }, []);

  // Sync creatures from context to local simulation state, preserving physics state
  useEffect(() => {
    setSimulatedCreatures(prev => {
      const prevMap = new Map(prev.map(c => [c.id, c]));
      
      return creatures.map(c => {
        const existing = prevMap.get(c.id);
        if (existing) {
          // Preserve physics state
          return { 
            ...c, 
            x: existing.x, 
            y: existing.y, 
            vx: existing.vx, 
            vy: existing.vy, 
            isScared: existing.isScared 
          };
        }
        
        // Initialize new creature with random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.03; // Base floating speed
        return { 
          ...c, 
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          isScared: false 
        };
      });
    });
  }, [creatures]);

  // Physics Loop
  const animate = () => {
    setSimulatedCreatures(prevCreatures => {
      const nightmares = prevCreatures.filter(c => c.type === 'nightmare');
      
      return prevCreatures.map(creature => {
        let { vx, vy, x, y } = creature;
        let isScared = false;
        
        const BASE_SPEED = 0.03;
        const RUN_SPEED = 0.15;
        const DETECTION_RADIUS = 25;

        // Interaction Logic (Dreams run from Nightmares)
        if (creature.type === 'dream') {
          nightmares.forEach(nm => {
            // Calculate distance based on percentage coordinates
            const dx = x - nm.x;
            const dy = y - nm.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < DETECTION_RADIUS && dist > 0) {
               // Repulsion force
               const force = (DETECTION_RADIUS - dist) / DETECTION_RADIUS;
               
               vx += (dx / dist) * force * 0.05;
               vy += (dy / dist) * force * 0.05;
               
               if (dist < 20) isScared = true;
            }
          });
        }

        // Normalize Velocity
        // If scared, we allow higher speed. If not, dampen towards base speed.
        const currentSpeed = Math.sqrt(vx*vx + vy*vy);
        const targetSpeed = isScared ? RUN_SPEED : BASE_SPEED;
        
        if (currentSpeed > 0) {
           // Smoothly adjust speed
           const newSpeed = currentSpeed + (targetSpeed - currentSpeed) * 0.05;
           vx = (vx / currentSpeed) * newSpeed;
           vy = (vy / currentSpeed) * newSpeed;
        }

        // Apply Position Update
        let newX = x + vx;
        let newY = y + vy;

        // Boundary Bounce
        if (newX <= 2 || newX >= 98) {
          vx = -vx;
          newX = Math.max(2, Math.min(98, newX));
        }
        if (newY <= 2 || newY >= 98) {
          vy = -vy;
          newY = Math.max(2, Math.min(98, newY));
        }

        return { ...creature, x: newX, y: newY, vx, vy, isScared };
      });
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);


  const handleCreatureClick = (c: Creature) => {
    setSelectedCreature(c);
    setIsSharing(false);
    setShareCaption('');
  };

  const handleShare = () => {
    if (!selectedCreature) return;
    
    addForumPost({
      id: Math.random().toString(36).substr(2, 9),
      author: 'You',
      creature: selectedCreature,
      caption: shareCaption,
      likes: 0,
      reactions: {},
      comments: [],
      timestamp: Date.now(),
    });
    
    setSelectedCreature(null); // Close modal
    setIsSharing(false);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-night-900 via-night-800 to-night-900 overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>

      {simulatedCreatures.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-center p-8">
          <p>{t.noCreatures}</p>
        </div>
      )}

      {/* Creatures Container */}
      <div className="absolute inset-0 pointer-events-none">
        {simulatedCreatures.map((creature) => (
          <div
            key={creature.id}
            className="absolute pointer-events-auto will-change-transform"
            style={{
              transform: `translate3d(${creature.x * (window.innerWidth / 100)}px, ${creature.y * (window.innerHeight / 100)}px, 0)`,
              // Using transform is more performant for continuous animation
            }}
          >
             {/* Centering wrapper since x/y are top-left coords essentially */}
             <div className="-translate-x-1/2 -translate-y-1/2">
               <CreatureVisual 
                  creature={creature} 
                  onClick={() => handleCreatureClick(creature)}
                  isScared={creature.isScared}
               />
             </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCreature && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-20 left-4 right-4 bg-night-700/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-40"
          >
            <button 
              onClick={() => setSelectedCreature(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Creature Header */}
            <div className="flex flex-col items-center mb-6">
              {/* Creature Thumbnail */}
              <div className="mb-4 pointer-events-none transform scale-150">
                <CreatureVisual creature={selectedCreature} />
              </div>

              <div className="text-3xl mb-2 flex gap-2 flex-wrap justify-center">
                {selectedCreature.emojis.map((e, i) => (
                  <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 100}ms`}}>{e}</span>
                ))}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${selectedCreature.type === 'nightmare' ? 'bg-red-900/50 text-red-200' : 'bg-dream-200/20 text-dream-200'}`}>
                {selectedCreature.type === 'nightmare' ? t.nightmareDesc : t.dreamDesc}
              </span>
            </div>

            {/* Main Content or Share Form */}
            {!isSharing ? (
              <div className="flex gap-2">
                {selectedCreature.type === 'dream' ? (
                  <button 
                    onClick={() => setIsSharing(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium transition-colors"
                  >
                    {t.share}
                  </button>
                ) : (
                  <div className="w-full bg-white/5 text-gray-500 py-3 rounded-xl text-sm font-medium text-center cursor-not-allowed">
                     Nightmares cannot be shared
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                 <textarea 
                   className="w-full bg-night-900/50 border border-white/10 rounded-xl p-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-dream-200"
                   rows={3}
                   placeholder={t.writeCaption}
                   value={shareCaption}
                   onChange={(e) => setShareCaption(e.target.value)}
                   autoFocus
                 />
                 <div className="flex gap-2">
                   <button 
                      onClick={() => setIsSharing(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg text-sm transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex-1 bg-dream-200 hover:bg-white text-night-900 font-bold py-2 rounded-lg text-sm transition-colors"
                    >
                      {t.post}
                    </button>
                 </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrainView;
