import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Called by the admin panel after a successful save.
 *
 * The session is verified on the server with the caller's cookies, so there is
 * no shared secret in client code and the endpoint is useless to anyone who is
 * not signed in.
 */
export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true, revalidatedAt: Date.now() });
}
