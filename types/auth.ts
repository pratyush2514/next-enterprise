import { type Session, type User } from "@supabase/supabase-js"

/**
 * User authentication data from Supabase Auth
 * Extends the base Supabase User type
 */
export type AuthUser = User

/**
 * Session data from Supabase Auth
 * Contains access token, refresh token, and user information
 */
export type AuthSession = Session

/**
 * User profile data stored in the profiles table
 * Contains extended user information beyond basic authentication
 */
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  date_of_birth: string | null
  gender: string | null
  created_at: string
  updated_at: string
}

/**
 * Authentication state used in React context
 * Provides current user, profile, and loading/error states
 */
export interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  error: Error | null
}

/**
 * Parameters for user registration
 * Used when creating a new account with email/password
 */
export interface SignUpParams {
  email: string
  password: string
  fullName: string
  dateOfBirth: string
  gender: string
}

/**
 * Parameters for user login
 * Used when authenticating with email/password
 */
export interface SignInParams {
  email: string
  password: string
}

/**
 * Parameters for updating user profile
 * All fields are optional to allow partial updates
 */
export interface UpdateProfileParams {
  fullName?: string
  dateOfBirth?: string
  gender?: string
  avatarUrl?: string
}

/**
 * Generic result type for authentication operations
 * Contains either data or error, never both
 */
export interface AuthResult<T = AuthUser> {
  data: T | null
  error: Error | null
}

/**
 * Result type for session operations
 * Returns both user and session data on success
 */
export interface SessionResult {
  data: {
    user: AuthUser
    session: AuthSession
  } | null
  error: Error | null
}
