import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type WebhookPayload = {
  action: string;
  token?: string;
  data: unknown;
};

type SignerCompleteData = {
  routingOrder?: number;
  status?: string;
  etchPacket?: { eid: string };
  signers?: Array<{ routingOrder?: number; status?: string }>;
};

type EtchPacketCompleteData = {
  eid: string;
  status?: string;
};

type SignerUpdateStatusData = {
  routingOrder?: number;
  status?: string;
  etchPacket?: { eid: string };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebhookPayload;
    const { action, data: rawData } = body;

    if (!action) {
      return new NextResponse(null, { status: 204 });
    }

    let data: unknown = rawData;
    if (typeof rawData === "string") {
      try {
        data = JSON.parse(rawData) as unknown;
      } catch {
        return new NextResponse(null, { status: 204 });
      }
    }

    const etchPacketEid =
      (data as SignerCompleteData)?.etchPacket?.eid ??
      (data as EtchPacketCompleteData)?.eid;

    if (!etchPacketEid) {
      return new NextResponse(null, { status: 204 });
    }

    const admin = createAdminClient();
    const { data: trainers } = await admin
      .from("trainers")
      .select("id")
      .eq("contract_etch_packet_eid", etchPacketEid);

    if (!trainers?.length) {
      return new NextResponse(null, { status: 204 });
    }

    const trainerId = trainers[0].id;

    if (action === "signerComplete") {
      const payload = data as SignerCompleteData;
      const routingOrder = payload.routingOrder ?? 0;
      if (routingOrder === 1) {
        await admin
          .from("trainers")
          .update({ contract_status: "club_signed" })
          .eq("id", trainerId);
      }
    } else if (action === "etchPacketComplete") {
      await admin
        .from("trainers")
        .update({ contract_status: "completed" })
        .eq("id", trainerId);
    } else if (action === "signerUpdateStatus") {
      const payload = data as SignerUpdateStatusData;
      if (payload.status === "declined") {
        await admin
          .from("trainers")
          .update({ contract_status: "declined" })
          .eq("id", trainerId);
      } else if (payload.status === "voided") {
        await admin
          .from("trainers")
          .update({ contract_status: "voided" })
          .eq("id", trainerId);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
