
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS, REACTION_EMOJIS } from '../constants';
import { CreatureVisual } from '../components/CreatureVisual';
import { Share2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Creature } from '../types';

const ForumView: React.FC = () => {
  const { language, forumPosts, toggleReaction, creatures, addForumPost } = useApp();
  const t = TEXTS[language];

  // New Post State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [caption, setCaption] = useState('');

  // Filter out nightmares for selection
  const shareableCreatures = creatures.filter(c => c.type === 'dream');

  const handlePost = () => {
    if (!selectedCreature) return;

    addForumPost({
      id: Math.random().toString(36).substr(2, 9),
      author: 'You',
      creature: selectedCreature,
      caption: caption,
      likes: 0,
      reactions: {},
      comments: [],
      timestamp: Date.now(),
    });

    // Reset
    setIsCreatingPost(false);
    setSelectedCreature(null);
    setCaption('');
  };

  return (
    <div className="h-full overflow-y-auto bg-night-900 pb-24 px-4 pt-6 no-scrollbar relative">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-dream-100 to-dream-300 mb-6 sticky top-0 z-20 backdrop-blur-sm py-2">
        {t.forum}
      </h1>

      <div className="space-y-6">
        {forumPosts.map((post) => (
          <div key={post.id} className="bg-night-800/50 border border-white/5 rounded-2xl p-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {post.author[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">{post.author}</div>
                  <div className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-night-900/50 rounded-xl p-6 flex flex-col items-center relative overflow-hidden mb-4 group">
               {/* Decorative glow behind creature */}
               <div className={`absolute inset-0 opacity-20 blur-2xl ${post.creature.color}`}></div>
               
               <div className="relative z-10 mb-4 transform group-hover:scale-110 transition-transform duration-500">
                  <CreatureVisual creature={{...post.creature, size: 1.5}} />
               </div>
               
               <div className="flex gap-2 text-2xl relative z-10">
                 {post.creature.emojis.map((e, i) => <span key={i}>{e}</span>)}
               </div>
            </div>

             {/* Caption */}
             {post.caption && (
                <div className="text-sm text-gray-300 mb-4 px-1 leading-relaxed">
                  {post.caption}
                </div>
             )}

            {/* Reactions & Share Bar */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {REACTION_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(post.id, emoji)}
                    className="flex items-center space-x-1 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors text-sm border border-white/5 text-gray-300"
                  >
                    <span>{emoji}</span>
                    <span className="text-xs text-gray-400">{post.reactions[emoji] || 0}</span>
                  </button>
                ))}
              </div>

              <button className="text-gray-400 hover:text-white transition-colors p-2">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAB to Add Post */}
      <button 
        onClick={() => setIsCreatingPost(true)}
        className="fixed bottom-24 right-6 bg-dream-200 hover:bg-white text-night-900 p-4 rounded-full shadow-lg transition-transform hover:scale-110 z-30"
      >
        <Plus size={24} />
      </button>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreatingPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6"
          >
             <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-night-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto flex flex-col"
             >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">{t.share}</h2>
                  <button onClick={() => setIsCreatingPost(false)} className="text-gray-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                {/* Step 1: Select Creature */}
                <div className="mb-4">
                   <h3 className="text-sm font-medium text-gray-400 mb-2">{t.selectCreature}</h3>
                   <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-night-900/50 rounded-xl border border-white/5">
                      {shareableCreatures.length === 0 ? (
                        <div className="col-span-4 py-8 text-center text-gray-500 text-sm">
                          {creatures.length > 0 ? "Nightmares cannot be shared." : t.noCreaturesToShare}
                        </div>
                      ) : (
                        shareableCreatures.map(creature => (
                          <button
                            key={creature.id}
                            onClick={() => setSelectedCreature(creature)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedCreature?.id === creature.id ? 'border-dream-200 bg-white/5' : 'border-transparent hover:bg-white/5'}`}
                          >
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <CreatureVisual creature={creature} className="scale-50" />
                             </div>
                          </button>
                        ))
                      )}
                   </div>
                </div>

                {/* Step 2: Caption */}
                <div className="mb-6 flex-1">
                  <textarea
                    className="w-full bg-night-900 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-dream-200 min-h-[100px]"
                    placeholder={t.writeCaption}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>

                {/* Step 3: Action */}
                <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => setIsCreatingPost(false)}
                      className="flex-1 py-3 rounded-xl text-gray-400 font-medium hover:bg-white/5"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      onClick={handlePost}
                      disabled={!selectedCreature}
                      className={`flex-1 py-3 rounded-xl font-bold text-night-900 transition-colors ${!selectedCreature ? 'bg-gray-600 cursor-not-allowed' : 'bg-dream-200 hover:bg-white'}`}
                    >
                      {t.post}
                    </button>
                </div>

             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForumView;
