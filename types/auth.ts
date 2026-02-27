/**
 * User profile data stored in the profiles table
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
