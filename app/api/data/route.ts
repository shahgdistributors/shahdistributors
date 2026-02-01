import { NextResponse } from "next/server"
import { normalizeDb, type DmsDb } from "@/lib/dms-data"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const TABLE_NAME = "dms_data"
const RECORD_ID = 1

const getRow = async () => {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from(TABLE_NAME).select("payload").eq("id", RECORD_ID).maybeSingle()
  if (error) {
    throw new Error(error.message)
  }
  return (data?.payload ?? null) as DmsDb | null
}

const upsertRow = async (db: DmsDb) => {
  const supabase = createSupabaseServerClient()
  const payload = {
    id: RECORD_ID,
    payload: db,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from(TABLE_NAME).upsert(payload, { onConflict: "id" })
  if (error) {
    throw new Error(error.message)
  }
}

export async function GET() {
  const stored = await getRow()
  const db = normalizeDb(stored)
  if (!stored) {
    await upsertRow(db)
  }
  return NextResponse.json(db)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = normalizeDb(body)
    await upsertRow(db)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
  }
}
