import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { Guide, Category, GuideStatus } from '../types';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

type GuideSubmission = {
  title: string;
  // FIX: Change Category enum to string to match form data type.
  category: string;
  city: string;
  area: string;
  steps: string[];
  tips: string[];
  tags: string[];
  author_id: string;
};

type GuideUpdate = Omit<GuideSubmission, 'author_id'>;

interface GuidesContextType {
  allGuides: Guide[];
  approvedGuides: Guide[];
  netizenGuides: Guide[];
  pendingGuides: Guide[];
  userGuides: Guide[];
  favoriteGuides: Guide[];
  favorites: string[];
  isLoading: boolean;
  addGuide: (guide: Omit<GuideSubmission, 'author_id'>) => Promise<void>;
  toggleFavorite: (guideId: string) => Promise<void>;
  isFavorite: (guideId: string) => boolean;
  approveGuide: (guideId: string) => Promise<void>;
  deleteGuide: (guideId: string) => Promise<void>;
  updateGuide: (guideId: string, updates: GuideUpdate) => Promise<void>;
  incrementGuideView: (guideId: string) => Promise<void>;
}

const GuidesContext = createContext<GuidesContextType | undefined>(undefined);

export function GuidesProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [allGuides, setAllGuides] = useState<Guide[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all guides (admins) or just approved ones (public)
  const fetchGuides = useCallback(async () => {
    setIsLoading(true);
    let query = supabase.from('guides').select('*, profiles(username)');
    
    if (currentUser?.role !== 'admin') {
      query = query.eq('status', 'approved');
    }
    
    const { data, error } = await query;
    if (data) setAllGuides(data as any); // Type assertion for joined profiles
    setIsLoading(false);
  }, [currentUser]);

  // Fetch user favorites
  const fetchFavorites = useCallback(async () => {
    if (!currentUser) {
        setFavorites([]);
        return;
    };
    const { data } = await supabase.from('user_favorites').select('guide_id').eq('user_id', currentUser.id);
    if (data) setFavorites(data.map(f => f.guide_id));
  }, [currentUser]);

  useEffect(() => {
    fetchGuides();
    fetchFavorites();
  }, [fetchGuides, fetchFavorites]);

  const derivedGuides = useMemo(() => {
    const approved = allGuides.filter(g => g.status === 'approved').sort((a, b) => a.title.localeCompare(b.title));
    const pending = allGuides.filter(g => g.status === 'pending');
    const allUserSubmitted = allGuides.filter(g => g.profiles?.username !== 'Admin'); // Assumes Admin profile exists
    const netizen = approved.filter(g => g.profiles?.username !== 'Admin');
    const favorite = approved.filter(g => favorites.includes(g.id));
    return { approved, pending, allUserSubmitted, netizen, favorite };
  }, [allGuides, favorites]);

  const addGuide = async (guideData: Omit<GuideSubmission, 'author_id'>) => {
    if (!currentUser) return;
    const newGuide: GuideSubmission = {
        ...guideData,
        author_id: currentUser.id
    };
    const { data, error } = await supabase.from('guides').insert(newGuide).select('*, profiles(username)').single();
    if (data) {
        setAllGuides(prev => [...prev, data as any]);
    }
  };

  const updateGuideStatus = async (guideId: string, status: GuideStatus) => {
    if (currentUser?.role !== 'admin') return;
    const { data, error } = await supabase.from('guides').update({ status }).eq('id', guideId).select('*, profiles(username)').single();
    if (data) {
        setAllGuides(prev => prev.map(g => g.id === guideId ? data as any : g));
    }
  };

  const approveGuide = async (guideId: string) => updateGuideStatus(guideId, 'approved');

  const deleteGuide = async (guideId: string) => {
    const { error } = await supabase.from('guides').delete().eq('id', guideId);
    if (!error) {
      setAllGuides(prev => prev.filter(guide => guide.id !== guideId));
    }
  };

  const updateGuide = async (guideId: string, updates: GuideUpdate) => {
    const guideToUpdate = allGuides.find(g => g.id === guideId);
    if (!guideToUpdate || !currentUser) return;
    if (currentUser.id !== guideToUpdate.author_id && currentUser.role !== 'admin') return;

    // Re-submit for review if not an admin
    const status = currentUser.role === 'admin' ? 'approved' : 'pending';

    const { data, error } = await supabase.from('guides').update({ ...updates, status }).eq('id', guideId).select('*, profiles(username)').single();
    if (data) {
        setAllGuides(prev => prev.map(g => g.id === guideId ? data as any : g));
    }
  };
  
  const incrementGuideView = async (guideId: string) => {
    const { error } = await supabase.rpc('increment_views', { guide_id: guideId });
     if (!error) {
        setAllGuides(prev => prev.map(guide => 
            guide.id === guideId 
                ? { ...guide, views: (guide.views || 0) + 1 } 
                : guide
        ));
     }
  };

  const toggleFavorite = async (guideId: string) => {
    if (!currentUser) return;
    const isCurrentlyFavorite = favorites.includes(guideId);
    
    if (isCurrentlyFavorite) {
      const { error } = await supabase.from('user_favorites').delete().match({ user_id: currentUser.id, guide_id: guideId });
      if (!error) setFavorites(prev => prev.filter(id => id !== guideId));
    } else {
      const { error } = await supabase.from('user_favorites').insert({ user_id: currentUser.id, guide_id: guideId });
      if (!error) setFavorites(prev => [...prev, guideId]);
    }
  };

  const isFavorite = useCallback((guideId: string): boolean => {
    return favorites.includes(guideId);
  }, [favorites]);

  const value = useMemo(() => ({
      allGuides,
      approvedGuides: derivedGuides.approved,
      netizenGuides: derivedGuides.netizen,
      pendingGuides: derivedGuides.pending,
      userGuides: derivedGuides.allUserSubmitted,
      favoriteGuides: derivedGuides.favorite,
      favorites,
      isLoading,
      addGuide,
      toggleFavorite,
      isFavorite,
      approveGuide,
      deleteGuide,
      updateGuide,
      incrementGuideView,
  }), [allGuides, favorites, isLoading, derivedGuides]);

  return (
    <GuidesContext.Provider value={value}>
      {children}
    </GuidesContext.Provider>
  );
}

export function useGuides(): GuidesContextType {
  const context = useContext(GuidesContext);
  if (context === undefined) {
    throw new Error('useGuides must be used within a GuidesProvider');
  }
  return context;
}
