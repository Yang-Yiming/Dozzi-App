import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { Creature, Language, Tab, ForumPost } from '../types';
import { MOCK_FORUM_POSTS } from '../constants';

interface AppContextType {
  creatures: Creature[];
  addCreature: (creature: Creature) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  forumPosts: ForumPost[];
  addForumPost: (post: ForumPost) => void;
  toggleReaction: (postId: string, emoji: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('brain');
  const [language, setLanguage] = useState<Language>('en');
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
  }, []);

  const addCreature = (creature: Creature) => {
    setCreatures(prev => {
      const updated = [...prev, creature];
      localStorage.setItem('dozzi_creatures', JSON.stringify(updated));
      return updated;
    });
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

  return (
    <AppContext.Provider value={{ 
      creatures, 
      addCreature, 
      activeTab, 
      setActiveTab, 
      language, 
      setLanguage,
      forumPosts,
      addForumPost,
      toggleReaction
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