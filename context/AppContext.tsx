import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren, useCallback } from 'react';
import { Creature, Language, Tab, ForumPost } from '../types';
import { MOCK_FORUM_POSTS } from '../constants';

// Creature dissolve time: 24 hours in milliseconds
const DISSOLVE_TIME_MS = 24 * 60 * 60 * 1000;

interface AppContextType {
  creatures: Creature[];
  addCreature: (creature: Creature) => void;
  updateCreatures: (creatures: Creature[]) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  creatureScale: number;
  setCreatureScale: (scale: number) => void;
  forumPosts: ForumPost[];
  addForumPost: (post: ForumPost) => void;
  toggleReaction: (postId: string, emoji: string) => void;
  // Archive functionality
  archivedCreatures: Creature[];
  archiveCreature: (creatureId: string) => void;
  removeFromArchive: (creatureId: string) => void;
  isCreatureArchived: (creatureId: string) => boolean;
  dissolveCreature: (creatureId: string) => void;
  getTimeUntilDissolve: (creature: Creature) => number;
  transformNightmare: (creatureId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [archivedCreatures, setArchivedCreatures] = useState<Creature[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('brain');
  const [language, setLanguage] = useState<Language>('en');
  const [creatureScale, setCreatureScale] = useState<number>(1.0);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(MOCK_FORUM_POSTS);

  // Load from local storage on mount (mock persistence)
  useEffect(() => {
    const storedCreatures = localStorage.getItem('dozzi_creatures');
    if (storedCreatures) {
      try {
        setCreatures(JSON.parse(storedCreatures));
      } catch (e) {
        console.error("Failed to parse stored creatures");
      }
    }
    
    const storedArchived = localStorage.getItem('dozzi_archived_creatures');
    if (storedArchived) {
      try {
        setArchivedCreatures(JSON.parse(storedArchived));
      } catch (e) {
        console.error("Failed to parse stored archived creatures");
      }
    }
    
    const storedScale = localStorage.getItem('dozzi_creature_scale');
    if (storedScale) {
        setCreatureScale(parseFloat(storedScale));
    }
  }, []);

  // Auto-dissolve check - runs every minute
  useEffect(() => {
    const checkDissolve = () => {
      const now = Date.now();
      setCreatures(prev => {
        const filtered = prev.filter(c => {
          // Archived creatures don't dissolve
          if (c.isArchived) return true;
          // Nightmares never dissolve naturally
          if (c.type === 'nightmare') return true;
          // Check if creature should dissolve
          const age = now - c.createdAt;
          return age < DISSOLVE_TIME_MS;
        });
        if (filtered.length !== prev.length) {
          localStorage.setItem('dozzi_creatures', JSON.stringify(filtered));
        }
        return filtered;
      });
    };

    // Check immediately on mount
    checkDissolve();
    
    // Then check every minute
    const interval = setInterval(checkDissolve, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSetCreatureScale = (scale: number) => {
      setCreatureScale(scale);
      localStorage.setItem('dozzi_creature_scale', scale.toString());
  };

  const addCreature = (creature: Creature) => {
    setCreatures(prev => {
      const updated = [...prev, creature];
      localStorage.setItem('dozzi_creatures', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCreatures = (updatedCreatures: Creature[]) => {
    setCreatures(updatedCreatures);
    localStorage.setItem('dozzi_creatures', JSON.stringify(updatedCreatures));
  };

  const addForumPost = (post: ForumPost) => {
    setForumPosts(prev => [post, ...prev]);
  };

  const toggleReaction = (postId: string, emoji: string) => {
    setForumPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      
      const newReactions = { ...post.reactions };
      // Simple increment for this mock (in real app, would toggle per user)
      newReactions[emoji] = (newReactions[emoji] || 0) + 1;
      
      return { ...post, reactions: newReactions };
    }));
  };

  // Archive a creature - saves a copy to archive (original stays in brain)
  const archiveCreature = useCallback((creatureId: string) => {
    // First, find the creature in the current state
    const creature = creatures.find(c => c.id === creatureId);
    if (!creature) return;
    
    // Check if already archived to prevent duplicates
    if (archivedCreatures.some(c => c.id === creatureId)) return;
    
    const archivedCreature: Creature = {
      ...creature,
      isArchived: true,
      archivedAt: Date.now(),
    };
    
    // Add a copy to archived list (original stays in brain)
    setArchivedCreatures(prevArchived => {
      const updated = [...prevArchived, archivedCreature];
      localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updated));
      return updated;
    });
  }, [creatures, archivedCreatures]);

  // Remove a creature from archive (just removes the record, doesn't affect brain)
  const removeFromArchive = useCallback((creatureId: string) => {
    setArchivedCreatures(prev => {
      const updated = prev.filter(c => c.id !== creatureId);
      localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Check if a creature is archived
  const isCreatureArchived = useCallback((creatureId: string) => {
    return archivedCreatures.some(c => c.id === creatureId);
  }, [archivedCreatures]);

  // Dissolve a creature - permanently removes it
  const dissolveCreature = useCallback((creatureId: string) => {
    // Check active creatures first
    setCreatures(prev => {
      const updated = prev.filter(c => c.id !== creatureId);
      if (updated.length !== prev.length) {
        localStorage.setItem('dozzi_creatures', JSON.stringify(updated));
      }
      return updated;
    });
    
    // Also check archived creatures
    setArchivedCreatures(prev => {
      const updated = prev.filter(c => c.id !== creatureId);
      if (updated.length !== prev.length) {
        localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Get time remaining until creature dissolves (in ms)
  const getTimeUntilDissolve = useCallback((creature: Creature): number => {
    if (creature.isArchived) return Infinity;
    // Nightmares never dissolve
    if (creature.type === 'nightmare') return Infinity;
    const age = Date.now() - creature.createdAt;
    return Math.max(0, DISSOLVE_TIME_MS - age);
  }, []);

  // Transform a nightmare into a dream
  const transformNightmare = useCallback((creatureId: string) => {
    setCreatures(prev => {
      const updated = prev.map(c => {
        if (c.id === creatureId && c.type === 'nightmare') {
          // Transform nightmare to dream
          return {
            ...c,
            type: 'dream' as const,
            createdAt: Date.now(), // Reset creation time so it doesn't dissolve immediately
            // Visual params will be regenerated by the caller if needed
          };
        }
        return c;
      });
      localStorage.setItem('dozzi_creatures', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{ 
      creatures, 
      addCreature, 
      updateCreatures,
      activeTab, 
      setActiveTab, 
      language, 
      setLanguage,
      creatureScale,
      setCreatureScale: handleSetCreatureScale,
      forumPosts,
      addForumPost,
      toggleReaction,
      archivedCreatures,
      archiveCreature,
      removeFromArchive,
      isCreatureArchived,
      dissolveCreature,
      getTimeUntilDissolve,
      transformNightmare,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};