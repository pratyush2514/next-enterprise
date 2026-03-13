/**
 * Database types for Supabase
 * Generated from database schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Gender = "male" | "female" | "non-binary" | "other" | "prefer-not-to-say"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: Gender | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: Gender | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: Gender | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          track_id: number
          track_name: string
          artist_name: string
          artwork_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id: number
          track_name: string
          artist_name: string
          artwork_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: number
          track_name?: string
          artist_name?: string
          artwork_url?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: {
        Args: { email_to_check: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
