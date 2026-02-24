import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { birthdateFromNationalId } from "@/lib/utils/birthdate";
import { NextResponse } from "next/server";
import type { Trainer } from "@/types/database";

async function getTripletexSession() {
  const consumer = process.env.TRIPLETEX_CONSUMER_TOKEN;
  const employee = process.env.TRIPLETEX_EMPLOYEE_TOKEN;
  const useTest = process.env.TRIPLETEX_USE_TEST !== "false";
  const baseUrl = useTest
    ? "https://api-test.tripletex.tech/v2"
    : "https://tripletex.no/v2";

  if (!consumer || !employee) {
    throw new Error("Tripletex credentials not configured");
  }

  const url = `${baseUrl}/token/session/:create?consumerToken=${encodeURIComponent(consumer)}&employeeToken=${encodeURIComponent(employee)}&expirationDate=2099-12-31`;
  const res = await fetch(url, { method: "PUT" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tripletex auth failed: ${text}`);
  }
  const data = await res.json();
  const token = data?.value?.token ?? data?.token;
  if (!token) throw new Error("No session token from Tripletex");
  return { token, baseUrl };
}

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
          { error: "Kun administratorer kan synkronisere til Tripletex" },
          { status: 403 }
        );
      }
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data } = await admin
      .from("trainers")
      .select("*")
      .eq("id", id)
      .single();

    const trainer = data as Trainer | null;
    if (!trainer) {
      return NextResponse.json({ error: "Trener ikke funnet" }, { status: 404 });
    }

    if (!trainer.email) {
      return NextResponse.json(
        { error: "Trener mangler e-post for Tripletex-sync" },
        { status: 400 }
      );
    }

    const nameParts = (trainer.name || "Unknown").trim().split(/\s+/);
    const firstName = nameParts[0]?.slice(0, 50) ?? "Unknown";
    const lastName = nameParts.slice(1).join(" ").slice(0, 50) || firstName;

    const payload: Record<string, unknown> = {
      firstName,
      lastName,
      email: (trainer.email ?? "").slice(0, 100),
      address: {
        addressLine1: (trainer.street || "-").slice(0, 100),
        addressLine2: trainer.street2?.slice(0, 100) || undefined,
        postalCode: (trainer.zip || "0").slice(0, 10),
        city: (trainer.city || "-").slice(0, 100),
      },
    };

    if (trainer.bank_account_number) {
      payload.bankAccountNumber = String(trainer.bank_account_number)
        .replace(/\s/g, "")
        .slice(0, 30);
    }
    // Tripletex krever samsvar mellom nationalIdentityNumber og dateOfBirth (første 6 sifre = DDMMYY)
    // Bruker derfor alltid dato utledet fra fødselsnummer når begge sendes
    if (trainer.national_identity_number) {
      const digits = String(trainer.national_identity_number).replace(/\D/g, "");
      if (digits.length === 11) {
        payload.nationalIdentityNumber = digits;
        const derivedBirthdate = birthdateFromNationalId(digits);
        if (derivedBirthdate) {
          payload.dateOfBirth = derivedBirthdate;
        }
      }
    }
    if (!payload.dateOfBirth && trainer.birthdate) {
      payload.dateOfBirth = trainer.birthdate;
    }

    const userType = process.env.TRIPLETEX_USER_TYPE || "STANDARD";
    if (["STANDARD", "EXTENDED", "NO_ACCESS"].includes(userType)) {
      payload.userType = userType;
    }

    const { token, baseUrl } = await getTripletexSession();
    const basicAuth = Buffer.from(`0:${token}`).toString("base64");

    const headers = {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    };

    let empId: number | null = null;

    if (trainer.tripletex_id) {
      const putRes = await fetch(`${baseUrl}/employee/${trainer.tripletex_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (putRes.status === 404) {
        await admin.from("trainers").update({ tripletex_id: null }).eq("id", id);
      } else if (putRes.ok) {
        const json = await putRes.json();
        empId = json?.value?.id ?? json?.id;
      } else {
        const text = await putRes.text();
        let errMsg = `Tripletex PUT feilet: ${putRes.status}`;
        try {
          const errJson = JSON.parse(text);
          const validation = errJson?.validationMessages as Array<{ field?: string; message?: string }> | undefined;
          if (Array.isArray(validation) && validation.length > 0) {
            errMsg += ` – ${validation.map((v) => `${v.field}: ${v.message}`).join(", ")}`;
          } else {
            errMsg += ` – ${text.slice(0, 300)}`;
          }
        } catch {
          errMsg += ` – ${text.slice(0, 300)}`;
        }
        return NextResponse.json({ error: errMsg }, { status: 502 });
      }
    }

    if (!empId) {
      const postRes = await fetch(`${baseUrl}/employee`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!postRes.ok) {
        const text = await postRes.text();
        let errMsg = `Tripletex POST feilet: ${postRes.status}`;
        try {
          const errJson = JSON.parse(text);
          const validation = errJson?.validationMessages as Array<{ field?: string; message?: string }> | undefined;
          if (Array.isArray(validation) && validation.length > 0) {
            const details = validation.map((v) => `${v.field}: ${v.message}`).join(", ");
            errMsg += ` – ${details}`;
          } else {
            errMsg += ` – ${text.slice(0, 300)}`;
          }
        } catch {
          errMsg += ` – ${text.slice(0, 300)}`;
        }
        return NextResponse.json({ error: errMsg }, { status: 502 });
      }
      const json = await postRes.json();
      empId = json?.value?.id ?? json?.id;
    }

    if (empId) {
      await admin.from("trainers").update({ tripletex_id: empId }).eq("id", id);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ukjent feil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
