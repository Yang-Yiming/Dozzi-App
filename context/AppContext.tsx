import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren, useCallback } from 'react';
import { Creature, Language, Tab, ForumPost, Family, VisualParams } from '../types';
import { MOCK_FORUM_POSTS } from '../constants';

// Creature dissolve time: 24 hours in milliseconds
const DISSOLVE_TIME_MS = 24 * 60 * 60 * 1000;

// Calculate the norm (Euclidean distance) between two creatures' visual parameters
const calculateVisualParamDistance = (params1?: VisualParams, params2?: VisualParams): number => {
  if (!params1 || !params2) return Infinity;
  
  // Extract key features for comparison
  const features1 = [
    params1.baseRadius,
    ...params1.baseColor,
    params1.eyeOffset.x,
    params1.eyeOffset.y,
    params1.points.length,
  ];
  
  const features2 = [
    params2.baseRadius,
    ...params2.baseColor,
    params2.eyeOffset.x,
    params2.eyeOffset.y,
    params2.points.length,
  ];
  
  // Normalize and calculate Euclidean distance
  let sumSquares = 0;
  for (let i = 0; i < features1.length; i++) {
    const diff = (features1[i] - features2[i]) / Math.max(Math.abs(features1[i]), Math.abs(features2[i]), 1);
    sumSquares += diff * diff;
  }
  
  return Math.sqrt(sumSquares);
};

// Pending archive state for family replacement dialog
interface PendingArchive {
  creature: Creature;
  existingFamily: Family | null;
  existingRepresentative: Creature | null;
}

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
  // Family functionality
  familyThreshold: number;
  setFamilyThreshold: (threshold: number) => void;
  mergeFamily: boolean;
  setMergeFamily: (merge: boolean) => void;
  families: Family[];
  getFamilyByCreatureId: (creatureId: string) => Family | undefined;
  getFamilyMembers: (familyId: string) => Creature[];
  // Pending archive for family replacement
  pendingArchive: PendingArchive | null;
  confirmArchiveReplace: () => void;
  confirmArchiveKeepBoth: () => void;
  cancelPendingArchive: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [archivedCreatures, setArchivedCreatures] = useState<Creature[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('brain');
  const [language, setLanguage] = useState<Language>('en');
  const [creatureScale, setCreatureScale] = useState<number>(1.0);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(MOCK_FORUM_POSTS);
  // Family settings
  const [familyThreshold, setFamilyThreshold] = useState<number>(0.5);
  const [mergeFamily, setMergeFamily] = useState<boolean>(true);
  const [families, setFamilies] = useState<Family[]>([]);
  const [pendingArchive, setPendingArchive] = useState<PendingArchive | null>(null);

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
    
    const storedFamilies = localStorage.getItem('dozzi_families');
    if (storedFamilies) {
      try {
        setFamilies(JSON.parse(storedFamilies));
      } catch (e) {
        console.error("Failed to parse stored families");
      }
    }
    
    const storedThreshold = localStorage.getItem('dozzi_family_threshold');
    if (storedThreshold) {
      setFamilyThreshold(parseFloat(storedThreshold));
    }
    
    const storedMergeFamily = localStorage.getItem('dozzi_merge_family');
    if (storedMergeFamily !== null) {
      setMergeFamily(storedMergeFamily === 'true');
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

  const handleSetFamilyThreshold = (threshold: number) => {
    setFamilyThreshold(threshold);
    localStorage.setItem('dozzi_family_threshold', threshold.toString());
  };

  const handleSetMergeFamily = (merge: boolean) => {
    setMergeFamily(merge);
    localStorage.setItem('dozzi_merge_family', merge.toString());
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

  // Find a family that the creature might belong to based on visual similarity
  const findMatchingFamily = useCallback((creature: Creature): { family: Family; representative: Creature } | null => {
    for (const family of families) {
      const representative = archivedCreatures.find(c => c.id === family.representativeId);
      if (representative) {
        const distance = calculateVisualParamDistance(creature.visualParams, representative.visualParams);
        if (distance < familyThreshold) {
          return { family, representative };
        }
      }
    }
    return null;
  }, [families, archivedCreatures, familyThreshold]);

  // Get family by creature ID
  const getFamilyByCreatureId = useCallback((creatureId: string): Family | undefined => {
    return families.find(f => f.memberIds.includes(creatureId));
  }, [families]);

  // Get all creatures in a family
  const getFamilyMembers = useCallback((familyId: string): Creature[] => {
    const family = families.find(f => f.id === familyId);
    if (!family) return [];
    return archivedCreatures.filter(c => family.memberIds.includes(c.id));
  }, [families, archivedCreatures]);

  // Archive a creature - saves a copy to archive (original stays in brain)
  const archiveCreature = useCallback((creatureId: string) => {
    // First, find the creature in the current state
    const creature = creatures.find(c => c.id === creatureId);
    if (!creature) return;
    
    // Check if already archived to prevent duplicates
    if (archivedCreatures.some(c => c.id === creatureId)) return;
    
    // Check if creature belongs to an existing family
    const match = findMatchingFamily(creature);
    if (match) {
      // Set pending archive to show replacement dialog
      setPendingArchive({
        creature,
        existingFamily: match.family,
        existingRepresentative: match.representative,
      });
      return;
    }
    
    // No matching family - create new family and archive directly
    const archivedCreature: Creature = {
      ...creature,
      isArchived: true,
      archivedAt: Date.now(),
      isRepresentative: true,
    };
    
    const newFamily: Family = {
      id: `family_${Date.now()}`,
      representativeId: creature.id,
      memberIds: [creature.id],
      createdAt: Date.now(),
    };
    
    archivedCreature.familyId = newFamily.id;
    
    // Add to archived list
    setArchivedCreatures(prevArchived => {
      const updated = [...prevArchived, archivedCreature];
      localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updated));
      return updated;
    });
    
    // Add new family
    setFamilies(prevFamilies => {
      const updated = [...prevFamilies, newFamily];
      localStorage.setItem('dozzi_families', JSON.stringify(updated));
      return updated;
    });
  }, [creatures, archivedCreatures, findMatchingFamily]);

  // Confirm archive with replacement (replace representative)
  const confirmArchiveReplace = useCallback(() => {
    if (!pendingArchive || !pendingArchive.existingFamily) return;
    
    const { creature, existingFamily, existingRepresentative } = pendingArchive;
    
    // Create archived creature as new representative
    const archivedCreature: Creature = {
      ...creature,
      isArchived: true,
      archivedAt: Date.now(),
      familyId: existingFamily.id,
      isRepresentative: true,
    };
    
    // Update archived creatures
    setArchivedCreatures(prevArchived => {
      const updated = prevArchived.map(c => {
        if (c.id === existingRepresentative?.id) {
          return { ...c, isRepresentative: false };
        }
        return c;
      });
      updated.push(archivedCreature);
      localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updated));
      return updated;
    });
    
    // Update family
    setFamilies(prevFamilies => {
      const updated = prevFamilies.map(f => {
        if (f.id === existingFamily.id) {
          return {
            ...f,
            representativeId: creature.id,
            memberIds: [...f.memberIds, creature.id],
          };
        }
        return f;
      });
      localStorage.setItem('dozzi_families', JSON.stringify(updated));
      return updated;
    });
    
    setPendingArchive(null);
  }, [pendingArchive]);

  // Confirm archive keeping both (add to family without replacing)
  const confirmArchiveKeepBoth = useCallback(() => {
    if (!pendingArchive || !pendingArchive.existingFamily) return;
    
    const { creature, existingFamily } = pendingArchive;
    
    // Create archived creature as non-representative member
    const archivedCreature: Creature = {
      ...creature,
      isArchived: true,
      archivedAt: Date.now(),
      familyId: existingFamily.id,
      isRepresentative: false,
    };
    
    // Add to archived list
    setArchivedCreatures(prevArchived => {
      const updated = [...prevArchived, archivedCreature];
      localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updated));
      return updated;
    });
    
    // Update family members
    setFamilies(prevFamilies => {
      const updated = prevFamilies.map(f => {
        if (f.id === existingFamily.id) {
          return {
            ...f,
            memberIds: [...f.memberIds, creature.id],
          };
        }
        return f;
      });
      localStorage.setItem('dozzi_families', JSON.stringify(updated));
      return updated;
    });
    
    setPendingArchive(null);
  }, [pendingArchive]);

  // Cancel pending archive
  const cancelPendingArchive = useCallback(() => {
    setPendingArchive(null);
  }, []);

  // Remove a creature from archive (just removes the record, doesn't affect brain)
  const removeFromArchive = useCallback((creatureId: string) => {
    // Get the creature's family info before removing
    const creature = archivedCreatures.find(c => c.id === creatureId);
    const familyId = creature?.familyId;
    
    setArchivedCreatures(prev => {
      const updated = prev.filter(c => c.id !== creatureId);
      localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updated));
      return updated;
    });
    
    // Update family if creature belonged to one
    if (familyId) {
      setFamilies(prevFamilies => {
        const updated = prevFamilies.map(f => {
          if (f.id === familyId) {
            const newMemberIds = f.memberIds.filter(id => id !== creatureId);
            // If this was the representative, assign new representative
            let newRepId = f.representativeId;
            if (f.representativeId === creatureId && newMemberIds.length > 0) {
              newRepId = newMemberIds[0];
              // Update the new representative creature
              setArchivedCreatures(prev => {
                const updatedCreatures = prev.map(c => {
                  if (c.id === newRepId) {
                    return { ...c, isRepresentative: true };
                  }
                  return c;
                });
                localStorage.setItem('dozzi_archived_creatures', JSON.stringify(updatedCreatures));
                return updatedCreatures;
              });
            }
            return {
              ...f,
              representativeId: newRepId,
              memberIds: newMemberIds,
            };
          }
          return f;
        }).filter(f => f.memberIds.length > 0); // Remove empty families
        localStorage.setItem('dozzi_families', JSON.stringify(updated));
        return updated;
      });
    }
  }, [archivedCreatures]);
  
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
      // Family functionality
      familyThreshold,
      setFamilyThreshold: handleSetFamilyThreshold,
      mergeFamily,
      setMergeFamily: handleSetMergeFamily,
      families,
      getFamilyByCreatureId,
      getFamilyMembers,
      pendingArchive,
      confirmArchiveReplace,
      confirmArchiveKeepBoth,
      cancelPendingArchive,
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