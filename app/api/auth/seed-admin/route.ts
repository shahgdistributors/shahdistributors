import { NextResponse } from "next/server"
const ADMIN_EMAIL = "shahgdistributors@gmail.com"
const ADMIN_PASSWORD = "Shahdistributors123"

const getAdminEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    return { ok: false as const, error: "Supabase env vars missing" }
  }
  return { ok: true as const, url, serviceRoleKey }
}

const getAdminHeaders = (serviceRoleKey: string) => ({
  Authorization: `Bearer ${serviceRoleKey}`,
  apikey: serviceRoleKey,
  "Content-Type": "application/json",
})

const seedAdmin = async (requestUrl?: string) => {
  try {
    const env = getAdminEnv()
    if (!env.ok) {
      return NextResponse.json({ ok: false, stage: "env", error: env.error }, { status: 500 })
    }

    if (requestUrl) {
      const url = new URL(requestUrl)
      if (url.searchParams.get("debug") === "1") {
        return NextResponse.json({
          ok: true,
          debug: {
            hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
            hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          },
        })
      }
    }

    const baseUrl = env.url.replace(/\/$/, "")
    const headers = getAdminHeaders(env.serviceRoleKey)

    const listResponse = await fetch(`${baseUrl}/auth/v1/admin/users?per_page=200`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    const listPayload = await listResponse.json().catch(() => null)
    if (!listResponse.ok) {
      const message = listPayload?.error || listPayload?.message || "Unable to list users"
      return NextResponse.json({ ok: false, stage: "listUsers", error: message }, { status: 500 })
    }

    const users = Array.isArray(listPayload?.users) ? listPayload.users : []
    const existing = users.find((user: { email?: string }) => user?.email === ADMIN_EMAIL)

    if (existing?.id) {
      const updateResponse = await fetch(`${baseUrl}/auth/v1/admin/users/${existing.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: "Shah Distributors", role: "Admin" },
        }),
      })
      const updatePayload = await updateResponse.json().catch(() => null)
      if (!updateResponse.ok) {
        const message = updatePayload?.error || updatePayload?.message || "Unable to update user"
        return NextResponse.json({ ok: false, stage: "updateUser", error: message }, { status: 500 })
      }
      return NextResponse.json({ ok: true, updated: true })
    }

    const createResponse = await fetch(`${baseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Shah Distributors", role: "Admin" },
      }),
    })
    const createPayload = await createResponse.json().catch(() => null)
    if (!createResponse.ok) {
      const message = createPayload?.error || createPayload?.message || "Unable to create user"
      return NextResponse.json({ ok: false, stage: "createUser", error: message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, created: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ ok: false, stage: "unknown", error: message }, { status: 500 })
  }
}

export async function POST() {
  return seedAdmin()
}

export async function GET(request: Request) {
  return seedAdmin(request.url)
}
