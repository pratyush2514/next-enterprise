/**
 * Property-Based Tests for Automatic Profile Creation
 *
 * These tests validate that creating a new auth user automatically triggers
 * creation of a corresponding profile record with the same user ID.
 *
 * Feature: supabase-authentication-system, Property 5: Automatic profile creation on signup
 * Validates: Requirements 2.5
 *
 * These tests require a running Supabase instance with SUPABASE_SERVICE_ROLE_KEY set.
 */

import { createClient } from "@supabase/supabase-js"
import { afterAll, describe, expect, it } from "vitest"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const skipMessage =
  "Skipping automatic profile creation tests: SUPABASE_SERVICE_ROLE_KEY not set. These tests require a service role key to create and delete test users."

function createTestUser() {
  const uniqueId = Math.random().toString(36).substring(7)
  return {
    email: `test-${uniqueId}@property-test.local`,
    password: "TestPassword123!",
  }
}

describe("Automatic Profile Creation Property", () => {
  if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
    console.warn(skipMessage)
  }

  const supabase =
    SUPABASE_URL && SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null

  const createdUserIds: string[] = []

  afterAll(async () => {
    if (!supabase) return
    for (const userId of createdUserIds) {
      await supabase.auth.admin.deleteUser(userId)
    }
  })

  // Feature: supabase-authentication-system, Property 5: Automatic profile creation on signup
  it("should automatically create profile when user signs up", async () => {
    if (!supabase) {
      console.log("Skipping test: SUPABASE_SERVICE_ROLE_KEY not set")
      return
    }

    const testUser = createTestUser()
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    })

    expect(error).toBeNull()
    expect(data.user).toBeDefined()
    createdUserIds.push(data.user!.id)

    // Wait for trigger to fire
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check that profile was automatically created
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single()

    expect(profileError).toBeNull()
    expect(profile).toBeDefined()
    expect(profile!.id).toBe(data.user!.id)
  })

  // Feature: supabase-authentication-system, Property 5: Automatic profile creation on signup
  it("should create profile with minimal metadata", async () => {
    if (!supabase) {
      console.log("Skipping test: SUPABASE_SERVICE_ROLE_KEY not set")
      return
    }

    const testUser = createTestUser()
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    })

    expect(error).toBeNull()
    expect(data.user).toBeDefined()
    createdUserIds.push(data.user!.id)

    // Wait for trigger to fire
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user!.id).single()

    expect(profile).toBeDefined()
    // Profile should exist with at least the id field matching the user
    expect(profile!.id).toBe(data.user!.id)
  })
})
