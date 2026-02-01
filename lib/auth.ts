import { storage } from "./storage"
import { createSupabaseBrowserClient } from "@/lib/supabase-client"

const toRole = (value?: string) => {
  if (value === "Sales" || value === "Inventory Manager") return value
  return "Admin"
}

const supabaseSignIn = async (email: string, password: string) => {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return false

  storage.setCurrentUser({
    id: data.user.id,
    username: data.user.email || email,
    password: "",
    fullName: data.user.user_metadata?.full_name || "Authenticated User",
    role: toRole(data.user.user_metadata?.role),
    createdAt: new Date().toISOString(),
  })
  return true
}

export async function login(username: string, password: string): Promise<boolean> {
  if (username.includes("@")) {
    return supabaseSignIn(username, password)
  }

  const user = storage.getUserByUsername(username)
  if (user && user.password === password) {
    storage.setCurrentUser(user)
    return true
  }

  return false
}

export function logout(): void {
  storage.clearCurrentUser()
  try {
    const supabase = createSupabaseBrowserClient()
    void supabase.auth.signOut()
  } catch {
    // Ignore sign-out errors for client-only auth.
  }
}

export function getCurrentUser() {
  return storage.getCurrentUser()
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function hasRole(role: string | string[]): boolean {
  const user = getCurrentUser()
  if (!user) return false

  if (Array.isArray(role)) {
    return role.includes(user.role)
  }

  return user.role === role
}

export async function hydrateAuthFromSupabase(): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session?.user) return false

    const user = data.session.user
    storage.setCurrentUser({
      id: user.id,
      username: user.email || "user",
      password: "",
      fullName: user.user_metadata?.full_name || "Authenticated User",
      role: toRole(user.user_metadata?.role),
      createdAt: new Date().toISOString(),
    })
    return true
  } catch {
    return false
  }
}
