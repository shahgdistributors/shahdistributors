import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const ADMIN_EMAIL = "shahgdistributors@gmail.com"
const ADMIN_PASSWORD = "Shahdistributors123"

const seedAdmin = async (requestUrl?: string) => {
  try {
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

    let supabase
    try {
      supabase = createSupabaseServerClient()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      return NextResponse.json({ ok: false, stage: "createClient", error: message }, { status: 500 })
    }
    const { data: existing, error: lookupError } = await supabase.auth.admin.getUserByEmail(ADMIN_EMAIL)
    if (lookupError) {
      return NextResponse.json({ ok: false, stage: "lookupUser", error: lookupError.message }, { status: 500 })
    }

    if (existing?.user) {
      return NextResponse.json({ ok: true, created: false })
    }

    const { error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: "Shah Distributors",
        role: "Admin",
      },
    })

    if (createError) {
      return NextResponse.json({ ok: false, stage: "createUser", error: createError.message }, { status: 500 })
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
