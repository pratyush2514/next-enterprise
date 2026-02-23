"use client"
export async function checkEmailExists(email: string, signal?: AbortSignal): Promise<{ exists: boolean }> {
  const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`, { signal })

  if (!res.ok) {
    throw new Error("Failed to check email")
  }

  return res.json() as Promise<{ exists: boolean }>
}
