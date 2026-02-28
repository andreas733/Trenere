const SPOND_API_BASE = "https://api.spond.com/core/v1";

export interface SpondSubgroup {
  id: string;
  name: string;
}

export interface SpondMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  subGroups?: string[];
}

export interface SpondGroup {
  id: string;
  name: string;
  members: SpondMember[];
  subGroups?: SpondSubgroup[];
}

export class SpondAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpondAuthError";
  }
}

/**
 * Login to Spond API and return the Bearer token.
 */
export async function spondLogin(
  username: string,
  password: string
): Promise<string> {
  const res = await fetch(`${SPOND_API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password }),
  });

  const data = (await res.json()) as { loginToken?: string };
  const token = data?.loginToken;

  if (!token) {
    throw new SpondAuthError(
      `Spond login failed. Response: ${JSON.stringify(data)}`
    );
  }

  return token;
}

/**
 * Fetch all groups from Spond (requires prior login to get token).
 * Groups include members with firstName, lastName, email, phoneNumber, subGroups.
 */
export async function spondGetGroups(token: string): Promise<SpondGroup[]> {
  const res = await fetch(`${SPOND_API_BASE}/groups/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spond get groups failed: ${res.status} – ${text}`);
  }

  const groups = (await res.json()) as SpondGroup[];
  return Array.isArray(groups) ? groups : [];
}
