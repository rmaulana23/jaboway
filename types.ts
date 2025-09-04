export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

// These enums can be used for consistency but the DB stores them as text
export enum Category {
  Transportasi = 'Transportasi',
  Pembayaran = 'Pembayaran',
  Fasilitas = 'Fasilitas',
  Layanan = 'Layanan',
  Kesehatan = 'Kesehatan',
  Darurat = 'Darurat',
  Hiburan = 'Hiburan',
  Tips = 'Tips',
  Lainnya = 'Lainnya',
}

export enum DiscussionCategory {
  Transportasi = 'Transportasi',
  GangguanDarurat = 'Gangguan/Darurat',
  AcaraKota = 'Acara Kota',
  TipsLokal = 'Tips Lokal',
  LowonganKerja = 'Lowongan Kerja',
}

// Type definitions based on the Supabase database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      guides: {
        Row: {
          area: string
          author_id: string
          category: string
          city: string
          created_at: string
          id: string
          status: string
          steps: string[]
          tags: string[] | null
          tips: string[] | null
          title: string
          views: number
          // FIX: Add links property to store URLs related to the guide.
          links: Json | null
        }
        Insert: {
          area: string
          author_id: string
          category: string
          city: string
          created_at?: string
          id?: string
          status?: string
          steps: string[]
          tags?: string[] | null
          tips?: string[] | null
          title: string
          views?: number
          // FIX: Add links property to store URLs related to the guide.
          links?: Json | null
        }
        Update: {
          area?: string
          author_id?: string
          category?: string
          city?: string
          created_at?: string
          id?: string
          status?: string
          steps?: string[]
          tags?: string[] | null
          tips?: string[] | null
          title?: string
          views?: number
          // FIX: Add links property to store URLs related to the guide.
          links?: Json | null
        }
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
      }
      post_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
        }
      }
      post_upvotes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
      }
      post_verifications: {
        Row: {
          post_id: string
          status: string
          user_id: string
        }
        Insert: {
          post_id: string
          status: string
          user_id: string
        }
        Update: {
          post_id?: string
          status?: string
          user_id?: string
        }
      }
      posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          title: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          title: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          title?: string
        }
      }
      profiles: {
        Row: {
          email: string
          id: string
          muted_until: string | null
          role: string
          status: string
          username: string
          warnings: Json | null
        }
        Insert: {
          email: string
          id: string
          muted_until?: string | null
          role?: string
          status?: string
          username: string
          warnings?: Json | null
        }
        Update: {
          email?: string
          id?: string
          muted_until?: string | null
          role?: string
          status?: string
          username?: string
          warnings?: Json | null
        }
      }
      user_favorites: {
        Row: {
          guide_id: string
          user_id: string
        }
        Insert: {
          guide_id: string
          user_id: string
        }
        Update: {
          guide_id?: string
          user_id?: string
        }
      }
    }
  }
}

// Custom types for the application frontend
export type Profile = Database['public']['Tables']['profiles']['Row'];
// FIX: Export User type for mock user data, which includes a password.
export type User = Profile & { password?: string };
export type Guide = Database['public']['Tables']['guides']['Row'] & { profiles: Pick<Profile, 'username'> | null };
export type GuideStatus = 'approved' | 'pending' | 'rejected';
export type UserWarning = { id: string; message: string; acknowledged: boolean; title?: string };

// Discussion related types
export type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: Pick<Profile, 'username'> | null;
  post_comments: [{ count: number }];
  post_upvotes: [{ count: number }];
  post_verifications: PostVerification[];
  post_reports: PostReport[];
};

export type PostComment = Database['public']['Tables']['post_comments']['Row'] & {
  profiles: Pick<Profile, 'username'> | null;
};
export type PostReport = Database['public']['Tables']['post_reports']['Row'] & {
  profiles: Pick<Profile, 'username'> | null;
};
export type PostVerification = Database['public']['Tables']['post_verifications']['Row'];
export type VerificationStatus = 'true' | 'questionable';