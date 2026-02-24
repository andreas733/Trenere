import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Anvil from "@anvilco/anvil";

const FILE_ID = "contract";

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
          { error: "Kun administratorer kan sende kontrakter" },
          { status: 403 }
        );
      }
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data: trainer } = await admin
      .from("trainers")
      .select(
        `
        *,
        wage_levels (id, name, hourly_wage, minimum_hours)
      `
      )
      .eq("id", id)
      .single() as { data: Record<string, unknown> | null };

    if (!trainer) {
      return NextResponse.json({ error: "Trener ikke funnet" }, { status: 404 });
    }

    const wageLevels = trainer.wage_levels;
    const wageLevel = Array.isArray(wageLevels)
      ? wageLevels[0]
      : wageLevels;
    if (!wageLevel || typeof wageLevel !== "object") {
      return NextResponse.json(
        { error: "Trener må ha lønnstrinn satt for å sende kontrakt." },
        { status: 400 }
      );
    }

    const wl = wageLevel as { hourly_wage?: number; minimum_hours?: number };
    const hourlyWage = wl.hourly_wage ?? 0;
    const minHours =
      (trainer.minimum_hours as number) ?? wl.minimum_hours ?? 0;
    const name = String(trainer.name || "").slice(0, 200);
    const email = trainer.email as string;
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Trener må ha gyldig e-post for å sende kontrakt." },
        { status: 400 }
      );
    }

    const castEid = process.env.ANVIL_PDF_TEMPLATE_EID;
    if (!castEid) {
      return NextResponse.json(
        { error: "Anvil PDF template ikke konfigurert (ANVIL_PDF_TEMPLATE_EID)." },
        { status: 500 }
      );
    }

    const fieldHourly = process.env.ANVIL_FIELD_HOURLY_WAGE || "timelonn";
    const fieldMinimum = process.env.ANVIL_FIELD_MINIMUM_HOURS || "antallTimer";
    const fieldFrom = process.env.ANVIL_FIELD_FROM_DATE || "fradato";
    const fieldTo = process.env.ANVIL_FIELD_TO_DATE || "tildato";
    const fieldName = process.env.ANVIL_FIELD_NAME || "navn";
    const fieldPnr = process.env.ANVIL_FIELD_PERSON_NUMBER || "pnr";
    const fieldAddress = process.env.ANVIL_FIELD_ADDRESS || "adresse";
    const fieldSigClub = process.env.ANVIL_FIELD_SIGNATURE_CLUB || "signature_club";
    const fieldSigUser = process.env.ANVIL_FIELD_SIGNATURE_USER || "signature_user";
    const clubEmail = process.env.ANVIL_CLUB_EMAIL || "hei@skiensvk.no";
    const clubName = process.env.ANVIL_CLUB_NAME || "Skien Svømmeklubb";

    const addrParts = [
      trainer.street,
      trainer.street2,
      [trainer.zip, trainer.city].filter(Boolean).join(" "),
    ].filter(Boolean);
    const address = addrParts.join(", ").slice(0, 300) || "-";
    const pnr = trainer.national_identity_number
      ? String(trainer.national_identity_number as string).replace(/\s/g, "").slice(0, 20)
      : "";

    const payloadData: Record<string, string> = {
      [fieldHourly]: String(hourlyWage),
      [fieldMinimum]: String(minHours),
      [fieldName]: name,
      [fieldAddress]: address,
    };
    if (pnr) payloadData[fieldPnr] = pnr;
    if (trainer.contract_from_date) {
      payloadData[fieldFrom] = new Date(trainer.contract_from_date as string).toLocaleDateString("nb-NO");
    }
    if (trainer.contract_to_date) {
      payloadData[fieldTo] = new Date(trainer.contract_to_date as string).toLocaleDateString("nb-NO");
    }

    const apiKey = process.env.ANVIL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anvil API-nøkkel ikke konfigurert." },
        { status: 500 }
      );
    }

    const useTest = process.env.ANVIL_USE_TEST !== "false";

    const anvil = new Anvil({ apiKey });

    const variables = {
      name: `Kontrakt for signering: ${name}`,
      signatureEmailSubject: "Vennligst signer kontrakten",
      isDraft: false,
      isTest: useTest,
      files: [
        {
          id: FILE_ID,
          castEid,
        },
      ],
      data: {
        payloads: {
          [FILE_ID]: {
            data: payloadData,
          },
        },
      },
      signers: [
        {
          id: "club",
          name: clubName,
          email: clubEmail,
          signerType: "email",
          routingOrder: 1,
          fields: [{ fileId: FILE_ID, fieldId: fieldSigClub }],
        },
        {
          id: "user",
          name,
          email,
          signerType: "email",
          routingOrder: 2,
          fields: [{ fileId: FILE_ID, fieldId: fieldSigUser }],
        },
      ],
    };

    const { statusCode, data, errors } = await anvil.createEtchPacket({
      variables,
    });

    if (statusCode !== 200 || errors?.length) {
      let msg = errors?.[0]?.message ?? JSON.stringify(data) ?? "Ukjent feil";
      if (msg.includes("connected to any signature fields")) {
        msg += " Sjekk at ANVIL_FIELD_SIGNATURE_CLUB og ANVIL_FIELD_SIGNATURE_USER matcher Field Alias i Anvil-malen (PDF Template).";
      }
      return NextResponse.json(
        { error: `Kunne ikke sende kontrakt til Anvil: ${msg}` },
        { status: 502 }
      );
    }

    const etchPacket = (data as { data?: { createEtchPacket?: unknown } })?.data?.createEtchPacket;
    return NextResponse.json({ ok: true, etchPacket });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ukjent feil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
