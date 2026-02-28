import { createClient } from "@/lib/supabase/server";
import { syncSwimmersFromSpond } from "@/lib/spond/sync";
import { NextResponse } from "next/server";

/**
 * POST /api/spond/sync
 * Sync swimmers from Spond to the database.
 * Allowed: admin users (session) or cron (Authorization: Bearer CRON_SECRET).
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    const isCron =
      cronSecret &&
      authHeader?.startsWith("Bearer ") &&
      authHeader.slice(7) === cronSecret;

    if (!isCron) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
      }
      const identities = user.identities ?? [];
      const isAzure = identities.some((i) => i.provider === "azure");
      if (!isAzure) {
        const { data: adminRow } = await supabase
          .from("admin_users")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        if (!adminRow) {
          return NextResponse.json(
            { error: "Kun administratorer kan synkronisere fra Spond" },
            { status: 403 }
          );
        }
      }
    }

    const result = await syncSwimmersFromSpond();

    return NextResponse.json({
      ok: true,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ukjent feil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
