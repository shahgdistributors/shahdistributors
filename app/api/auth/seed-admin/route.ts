import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const ADMIN_EMAIL = "shahgdistributors@gmail.com"
const ADMIN_PASSWORD = "Shahdistributors123"

export async function POST() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: existing, error: lookupError } = await supabase.auth.admin.getUserByEmail(ADMIN_EMAIL)
    if (lookupError) {
      return NextResponse.json({ ok: false, error: lookupError.message }, { status: 500 })
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
      return NextResponse.json({ ok: false, error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, created: true })
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Unable to seed admin user" }, { status: 500 })
  }
}
