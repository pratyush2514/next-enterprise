import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js"

/**
 * Parameters for user signup
 */
export interface SignUpParams {
  email: string
  password: string
  fullName: string
  dateOfBirth: string
  gender: string
}

/**
 * Parameters for user signin
 */
export interface SignInParams {
  email: string
  password: string
}

/**
 * Parameters for updating user profile
 */
export interface UpdateProfileParams {
  fullName?: string
  dateOfBirth?: string
  gender?: string
  avatarUrl?: string
}

/**
 * Authentication Service Class
 *
 * Provides a comprehensive interface to Supabase Auth APIs for user authentication,
 * session management, profile updates, and avatar uploads.
 */
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sign up a new user with email and password.
   * User metadata is stored and copied to profiles table via database trigger.
   */
  async signUp(params: SignUpParams) {
    const { data, error } = await this.supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          date_of_birth: params.dateOfBirth,
          gender: params.gender,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    return { data: data.user, error }
  }

  /**
   * Sign in with email and password.
   * Authenticates user and creates a session with access and refresh tokens.
   */
  async signIn(params: SignInParams) {
    return await this.supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    })
  }

  /**
   * Sign in with Google OAuth.
   * Returns OAuth URL for redirect.
   */
  async signInWithGoogle() {
    return await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_SITE_URL || "http://localhost:3000"}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })
  }

  /**
   * Sign out the current user.
   * Invalidates the session and clears stored tokens.
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    return await this.supabase.auth.signOut()
  }

  /**
   * Send password reset email.
   * Token expires after 1 hour.
   */
  async resetPasswordForEmail(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_SITE_URL || "http://localhost:3000"}/auth/callback?next=/auth/reset-password`,
    })
  }

  /**
   * Update user password.
   * Requires valid session.
   */
  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({
      password: newPassword,
    })
  }

  /**
   * Resend confirmation email.
   * Subject to rate limiting (60 second cooldown).
   */
  async resendConfirmationEmail(email: string) {
    return await this.supabase.auth.resend({
      type: "signup",
      email,
    })
  }

  /**
   * Get current session including user and token information.
   */
  async getSession() {
    return await this.supabase.auth.getSession()
  }

  /**
   * Get currently authenticated user.
   */
  async getUser(): Promise<{ data: User | null; error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.getUser()
    return { data: data.user, error }
  }

  /**
   * Update user profile in the profiles table.
   * Only the authenticated user can update their own profile (enforced by RLS).
   */
  async updateProfile(userId: string, params: UpdateProfileParams): Promise<{ error: Error | null }> {
    const { error } = await this.supabase
      .from("profiles")
      .update({
        full_name: params.fullName,
        date_of_birth: params.dateOfBirth,
        gender: params.gender,
        avatar_url: params.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    return { error }
  }

  /**
   * Upload user avatar to Supabase Storage.
   * Returns the public URL.
   */
  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await this.supabase.storage.from("avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      return { url: null, error: uploadError }
    }

    const { data } = this.supabase.storage.from("avatars").getPublicUrl(filePath)

    return { url: data.publicUrl, error: null }
  }
}
