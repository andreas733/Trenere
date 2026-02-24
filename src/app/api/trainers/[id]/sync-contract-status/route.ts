import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Anvil from "@anvilco/anvil";

const STATUS_MAP: Record<string, string> = {
  draft: "sent",
  sent: "sent",
  delivered: "sent",
  partial: "club_signed",
  completed: "completed",
  declined: "declined",
  voided: "voided",
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
          { error: "Kun administratorer kan hente kontraktstatus" },
          { status: 403 }
        );
      }
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data: trainer } = await admin
      .from("trainers")
      .select("contract_etch_packet_eid")
      .eq("id", id)
      .single();

    if (!trainer?.contract_etch_packet_eid) {
      return NextResponse.json(
        { error: "Ingen kontrakt sendt for denne treneren" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANVIL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anvil API-nøkkel ikke konfigurert." },
        { status: 500 }
      );
    }

    const anvil = new Anvil({ apiKey });
    const { statusCode, data, errors } = await anvil.requestGraphQL({
      query: `
        query EtchPacketStatus($eid: String!) {
          etchPacket(eid: $eid) {
            eid
            status
          }
        }
      `,
      variables: { eid: trainer.contract_etch_packet_eid },
    });

    if (statusCode !== 200 || errors?.length) {
      return NextResponse.json(
        { error: "Kunne ikke hente status fra Anvil" },
        { status: 502 }
      );
    }

    const packet = (data as { data?: { etchPacket?: { status?: string } } })
      ?.data?.etchPacket ?? null;
    const anvilStatus = packet?.status;

    if (anvilStatus) {
      const contractStatus = STATUS_MAP[anvilStatus] ?? "sent";
      await admin
        .from("trainers")
        .update({ contract_status: contractStatus })
        .eq("id", id);
    }

    return NextResponse.json({
      ok: true,
      status: STATUS_MAP[packet?.status ?? ""] ?? "sent",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ukjent feil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
