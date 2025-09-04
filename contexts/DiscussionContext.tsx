import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { Post, PostComment, VerificationStatus, PostReport, DiscussionCategory } from '../types';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';
import { t } from '../utils/i18n';

type PostSubmission = Pick<Post, 'title' | 'content' | 'category'>;

interface DiscussionContextType {
  posts: Post[];
  isLoading: boolean;
  addPost: (postData: PostSubmission) => Promise<void>;
  updatePost: (postId: string, postData: PostSubmission) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<PostComment | null>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  toggleUpvote: (postId: string) => Promise<void>;
  addVerification: (postId: string, status: VerificationStatus) => Promise<void>;
  togglePinPost: (postId: string, currentPinStatus: boolean) => Promise<void>;
  reportPost: (postId: string, reason: string) => Promise<void>;
  resolveReports: (postId: string) => Promise<void>;
  getComments: (postId: string) => Promise<PostComment[]>;
  getPostById: (postId: string) => Post | undefined;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

export function DiscussionProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, warnUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (username),
            post_comments (count),
            post_upvotes (count),
            post_verifications (*),
            post_reports (*)
        `);
    
    if (data) setPosts(data as any);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
    
    // Supabase Realtime subscriptions
    const postChannel = supabase.channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, 
        (payload) => {
            console.log('Post change received!', payload)
            // A simple refetch is the most reliable way to handle complex updates
            fetchPosts(); 
        })
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
    };
  }, [fetchPosts]);

  const addPost = async (postData: PostSubmission) => {
    if (!currentUser) return;
    await supabase.from('posts').insert({ ...postData, author_id: currentUser.id });
    // Realtime will handle the update
  };

  const updatePost = async (postId: string, postData: PostSubmission) => {
    await supabase.from('posts').update(postData).eq('id', postId);
    // Realtime will handle the update
  };

  const deletePost = async (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete || !currentUser) return;

    if (currentUser.role === 'admin' && postToDelete.post_reports && postToDelete.post_reports.length > 0) {
        const title = t('report_deleted_notification_title');
        const message = t('report_deleted_notification_message');
        const reporterIds = [...new Set(postToDelete.post_reports.map(r => r.reporter_id))];

        const promises = reporterIds.map(reporterId => {
            if (reporterId !== currentUser.id && reporterId !== postToDelete.author_id) {
                return warnUser(reporterId, message, title);
            }
            return Promise.resolve();
        });
        await Promise.all(promises);
    }
    await supabase.from('posts').delete().eq('id', postId);
    // Realtime will handle the update
  };

  const getComments = async (postId: string): Promise<PostComment[]> => {
    const { data } = await supabase
        .from('post_comments')
        .select('*, profiles(username)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    return (data as any) || [];
  };

  const addComment = async (postId: string, content: string): Promise<PostComment | null> => {
    if (!currentUser) return null;
    const { data } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, author_id: currentUser.id, content })
        .select('*, profiles(username)')
        .single();
    // Refetch post counts
    fetchPosts();
    return data as any;
  };

  const updateComment = async (commentId: string, content: string) => {
    await supabase.from('post_comments').update({ content }).eq('id', commentId);
    // Client must re-fetch comments
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from('post_comments').delete().eq('id', commentId);
    // Client must re-fetch comments & post counts
    fetchPosts();
  };

  const toggleUpvote = async (postId: string) => {
    if (!currentUser) return;
    // Check if user has already upvoted
    const { data } = await supabase.from('post_upvotes').select('user_id').eq('post_id', postId).eq('user_id', currentUser.id).single();

    if (data) { // Already upvoted, so remove
        await supabase.from('post_upvotes').delete().match({ post_id: postId, user_id: currentUser.id });
    } else { // Not upvoted, so add
        await supabase.from('post_upvotes').insert({ post_id: postId, user_id: currentUser.id });
    }
    fetchPosts();
  };
  
  const addVerification = async (postId: string, status: VerificationStatus) => {
    if (!currentUser) return;
    // Upsert ensures we can add or change a vote, but a user can only have one.
    // The composite primary key (post_id, user_id) enforces this.
    await supabase.from('post_verifications').upsert({ post_id: postId, user_id: currentUser.id, status });
    fetchPosts();
  };

  const togglePinPost = async (postId: string, currentPinStatus: boolean) => {
    if (currentUser?.role !== 'admin') return;
    await supabase.from('posts').update({ is_pinned: !currentPinStatus }).eq('id', postId);
    // Realtime will handle the update
  };
  
  const reportPost = async (postId: string, reason: string) => {
    if (!currentUser) return;
    await supabase.from('post_reports').insert({ post_id: postId, reporter_id: currentUser.id, reason });
    fetchPosts();
  };
  
  const resolveReports = async (postId: string) => {
     if (currentUser?.role !== 'admin') return;
     await supabase.from('post_reports').delete().eq('post_id', postId);
     fetchPosts();
  };

  const getPostById = useCallback((postId: string) => {
    return posts.find(p => p.id === postId);
  }, [posts]);

  const value = useMemo(() => ({ posts, isLoading, addPost, updatePost, deletePost, addComment, updateComment, deleteComment, toggleUpvote, addVerification, togglePinPost, reportPost, resolveReports, getPostById, getComments }), [posts, isLoading, fetchPosts]);

  return (
    <DiscussionContext.Provider value={value}>
      {children}
    </DiscussionContext.Provider>
  );
}

export function useDiscussion(): DiscussionContextType {
  const context = useContext(DiscussionContext);
  if (context === undefined) {
    throw new Error('useDiscussion must be used within a DiscussionProvider');
  }
  return context;
}
