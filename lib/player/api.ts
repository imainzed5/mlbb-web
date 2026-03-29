import "server-only";

import { fetchMlbbMutation } from "@/lib/mlbb/client";

import type { PlayerAuthLoginResult } from "./types";

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

export async function sendPlayerVerificationCode(roleId: number, zoneId: number) {
  await fetchMlbbMutation<unknown, { role_id: number; zone_id: number }>(
    "/user/auth/send-vc",
    {
      body: {
        role_id: roleId,
        zone_id: zoneId,
      },
    }
  );
}

export async function loginPlayerWithVerificationCode(
  roleId: number,
  zoneId: number,
  verificationCode: number
): Promise<PlayerAuthLoginResult> {
  const payload = await fetchMlbbMutation<unknown, { role_id: number; zone_id: number; vc: number }>(
    "/user/auth/login",
    {
      body: {
        role_id: roleId,
        zone_id: zoneId,
        vc: verificationCode,
      },
    }
  );
  const data = asObject(payload.data);
  const jwt = toStringValue(data?.jwt);
  const resolvedRoleId = toNumber(data?.roleid) ?? roleId;
  const resolvedZoneId = toNumber(data?.zoneid) ?? zoneId;

  if (!jwt) {
    throw new Error("The MLBB login response did not include a JWT.");
  }

  return {
    jwt,
    roleId: resolvedRoleId,
    token: toStringValue(data?.token),
    zoneId: resolvedZoneId,
  };
}

export async function logoutPlayerSession(jwt: string) {
  await fetchMlbbMutation<unknown, { jwt: string }>("/user/auth/logout", {
    body: { jwt },
  });
}

export async function fetchPlayerInfo(jwt: string) {
  const payload = await fetchMlbbMutation<unknown, { jwt: string }>("/user/info", {
    body: { jwt },
  });

  return payload.data;
}

export async function fetchPlayerStats(jwt: string) {
  const payload = await fetchMlbbMutation<unknown, { jwt: string }>("/user/stats", {
    body: { jwt },
  });

  return payload.data;
}

export async function fetchPlayerSeasonIds(jwt: string) {
  const payload = await fetchMlbbMutation<unknown, { jwt: string }>("/user/season", {
    body: { jwt },
  });

  return payload.data;
}

export async function fetchPlayerRecentMatches(
  jwt: string,
  options: { limit?: number; seasonId?: number } = {}
) {
  const payload = await fetchMlbbMutation<unknown, { jwt: string }>("/user/matches", {
    body: { jwt },
    searchParams: {
      limit: options.limit ?? 8,
      sid: options.seasonId ?? 0,
    },
  });

  return payload.data;
}

export async function fetchPlayerFrequentHeroes(
  jwt: string,
  options: { limit?: number; seasonId?: number } = {}
) {
  const payload = await fetchMlbbMutation<unknown, { jwt: string }>(
    "/user/heroes/frequent",
    {
      body: { jwt },
      searchParams: {
        limit: options.limit ?? 6,
        sid: options.seasonId ?? 0,
      },
    }
  );

  return payload.data;
}