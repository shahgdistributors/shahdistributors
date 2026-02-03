"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/auth"
import { initializeTheme } from "@/lib/theme"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeTheme()
    const seedAdmin = async () => {
      try {
        const response = await fetch("/api/auth/seed-admin", { method: "POST" })
        if (!response.ok) {
          setError("Unable to initialize admin account.")
          return
        }
        const result = await response.json()
        if (!result?.ok) {
          setError(result?.error || "Unable to initialize admin account.")
        }
      } catch {
        setError("Unable to initialize admin account.")
      }
    }
    void seedAdmin()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const trimmedUsername = username.trim()
      if (trimmedUsername.includes("@")) {
        try {
          const seedResponse = await fetch("/api/auth/seed-admin", { method: "POST" })
          if (!seedResponse.ok) {
            const payload = await seedResponse.json().catch(() => null)
            setError(payload?.error || "Unable to verify admin account.")
            setLoading(false)
            return
          }
          const payload = await seedResponse.json().catch(() => null)
          if (payload?.ok === false) {
            setError(payload?.error || "Unable to verify admin account.")
            setLoading(false)
            return
          }
        } catch {
          setError("Unable to verify admin account.")
          setLoading(false)
          return
        }
      }

      const result = await login(trimmedUsername, password)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Invalid username or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto flex items-center justify-center">
            <Image
              src="/images/9515d28e-1e5d-43a0-b693-b831d02b83eb-removalai-preview.png"
              alt="Shah Distributors"
              width={420}
              height={165}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">Distribution System</CardTitle>
            <CardDescription className="text-base mt-2">Sign in to access your DMS dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username or Email
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
