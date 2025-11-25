import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreatureVisual } from '../components/CreatureVisual';
import { TEXTS } from '../constants';
import { Creature } from '../types';
import { X, Trash2, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ArchiveView: React.FC = () => {
  const { archivedCreatures, language, removeFromArchive } = useApp();
  const t = TEXTS[language];
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleCreatureClick = (c: Creature) => {
    setSelectedCreature(c);
    setShowRemoveConfirm(false);
  };

  const handleRemove = () => {
    if (!selectedCreature) return;
    removeFromArchive(selectedCreature.id);
    setSelectedCreature(null);
    setShowRemoveConfirm(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-night-900 via-amber-950/20 to-night-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
            <Archive size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t.archive}</h1>
            <p className="text-xs text-amber-300/60">{archivedCreatures.length} creatures</p>
          </div>
        </div>
      </div>

      {/* Ambient Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl"></div>

      {archivedCreatures.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 text-center p-8">
          <div className="w-20 h-20 bg-amber-600/10 rounded-full flex items-center justify-center mb-4">
            <Archive size={32} className="text-amber-400/40" />
          </div>
          <p className="max-w-xs">{t.noArchivedCreatures}</p>
        </div>
      ) : (
        /* Creatures Grid */
        <div className="absolute inset-0 pt-24 pb-24 px-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {archivedCreatures.map((creature, index) => (
              <motion.div
                key={creature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCreatureClick(creature)}
                className="bg-night-800/50 backdrop-blur-sm border border-amber-500/10 rounded-2xl p-4 cursor-pointer hover:border-amber-500/30 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-2 transform scale-75">
                    <CreatureVisual creature={creature} />
                  </div>
                  <div className="text-lg flex gap-1 flex-wrap justify-center mb-1">
                    {creature.emojis.slice(0, 3).map((e, i) => (
                      <span key={i}>{e}</span>
                    ))}
                  </div>
                  {creature.archivedAt && (
                    <span className="text-[10px] text-amber-300/50">
                      {formatDate(creature.archivedAt)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCreature && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-20 left-4 right-4 bg-night-700/90 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-2xl z-40"
          >
            <button 
              onClick={() => setSelectedCreature(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Creature Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="mb-4 pointer-events-none transform scale-150">
                <CreatureVisual creature={selectedCreature} />
              </div>

              <div className="text-3xl mb-2 flex gap-2 flex-wrap justify-center">
                {selectedCreature.emojis.map((e, i) => (
                  <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 100}ms`}}>{e}</span>
                ))}
              </div>
              
              <span className={`text-xs px-2 py-1 rounded-full mb-2 ${selectedCreature.type === 'nightmare' ? 'bg-red-900/50 text-red-200' : 'bg-dream-200/20 text-dream-200'}`}>
                {selectedCreature.type === 'nightmare' ? t.nightmareDesc : t.dreamDesc}
              </span>
              
              {/* Archived date */}
              {selectedCreature.archivedAt && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300/70">
                  <Archive size={12} />
                  <span>{t.archivedOn} {formatDate(selectedCreature.archivedAt)}</span>
                </div>
              )}
            </div>

            {/* Remove Confirmation */}
            {showRemoveConfirm ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <p className="text-center text-gray-300 text-sm">{language === 'zh' ? '从收藏中移除？' : 'Remove from archive?'}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowRemoveConfirm(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleRemove}
                    className="flex-1 bg-red-600/80 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {t.removeFromArchive}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {/* Remove from Archive Button */}
                <button 
                  onClick={() => setShowRemoveConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-900/30 text-gray-400 hover:text-red-300 py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Trash2 size={14} />
                  {t.removeFromArchive}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArchiveView;
