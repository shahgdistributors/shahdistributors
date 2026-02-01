"use client"

import { useEffect } from "react"
import { storage } from "@/lib/storage"
import { hydrateAuthFromSupabase } from "@/lib/auth"

export function AppInitializer() {
  useEffect(() => {
    let active = true

    const sync = async () => {
      await hydrateAuthFromSupabase()
      const didSync = await storage.syncFromServer()
      if (didSync && active) {
        window.location.reload()
      }
    }

    sync()

    return () => {
      active = false
    }
  }, [])

  return null
}
