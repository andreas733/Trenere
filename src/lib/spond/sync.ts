import { createAdminClient } from "@/lib/supabase/admin";
import {
  spondGetGroups,
  spondLogin,
  type SpondGroup,
  type SpondMember,
} from "./client";

export interface SpondSyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Sync swimmers from Spond to the database.
 * Maps Spond members to parties via parties.spond_subgroup_id.
 * Members without a mapped subgroup are skipped.
 */
export async function syncSwimmersFromSpond(): Promise<SpondSyncResult> {
  const username = process.env.SPOND_USERNAME;
  const password = process.env.SPOND_PASSWORD;

  if (!username || !password) {
    throw new Error("SPOND_USERNAME and SPOND_PASSWORD must be set");
  }

  const result: SpondSyncResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  const supabase = createAdminClient();

  const token = await spondLogin(username, password);
  const groups = await spondGetGroups(token);

  const groupId = process.env.SPOND_GROUP_ID;
  const targetGroup: SpondGroup | undefined = groupId
    ? groups.find((g) => g.id === groupId)
    : groups[0];

  if (!targetGroup) {
    throw new Error(
      groupId
        ? `Spond group with id "${groupId}" not found`
        : "No Spond groups returned"
    );
  }

  // Exclude Svømmeskolen – vi henter ikke inn svømmere derfra
  const { data: parties } = await supabase
    .from("parties")
    .select("id, spond_subgroup_id")
    .not("spond_subgroup_id", "is", null)
    .neq("slug", "svommeskolen");

  const subgroupToPartyId = new Map<string, string>();
  for (const p of parties ?? []) {
    if (p.spond_subgroup_id) {
      subgroupToPartyId.set(p.spond_subgroup_id, p.id);
    }
  }

  const now = new Date().toISOString();

  for (const member of targetGroup.members ?? []) {
    const partyId = getPartyIdForMember(member, subgroupToPartyId);

    if (!partyId) {
      result.skipped += 1;
      continue;
    }

    const name = `${(member.firstName ?? "").trim()} ${(member.lastName ?? "").trim()}`.trim();
    if (!name) {
      result.skipped += 1;
      continue;
    }

    const swimmerRow = {
      spond_uid: member.id,
      name: name.slice(0, 500),
      email: member.email?.trim().slice(0, 255) || null,
      phone: member.phoneNumber?.trim().slice(0, 50) || null,
      party_id: partyId,
      synced_at: now,
      updated_at: now,
    };

    const { data: existing } = await supabase
      .from("swimmers")
      .select("id")
      .eq("spond_uid", member.id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("swimmers")
        .update(swimmerRow)
        .eq("spond_uid", member.id);

      if (error) {
        result.errors.push(`Update ${member.id}: ${error.message}`);
      } else {
        result.updated += 1;
      }
    } else {
      const { error } = await supabase.from("swimmers").insert(swimmerRow);

      if (error) {
        result.errors.push(`Insert ${member.id}: ${error.message}`);
      } else {
        result.created += 1;
      }
    }
  }

  return result;
}

function getPartyIdForMember(
  member: SpondMember,
  subgroupToPartyId: Map<string, string>
): string | null {
  const subgroupIds = member.subGroups ?? [];
  if (subgroupIds.length === 0) return null;

  for (const sgId of subgroupIds) {
    const partyId = subgroupToPartyId.get(sgId);
    if (partyId) return partyId;
  }

  return null;
}
