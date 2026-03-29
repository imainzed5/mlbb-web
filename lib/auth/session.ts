import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const PLAYER_SESSION_COOKIE = "mlbb-player-session";
const PLAYER_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type PlayerSession = {
  expiresAt: number;
  issuedAt: number;
  jwt: string;
  roleId: number;
  token: string | null;
  zoneId: number;
};

type CreatePlayerSessionOptions = {
  jwt: string;
  roleId: number;
  token?: string | null;
  zoneId: number;
};

export const PLAYER_SESSION_SECRET_ERROR =
  "MLBB_PLAYER_SESSION_SECRET is not configured.";

function getSessionSecret() {
  const secret = process.env.MLBB_PLAYER_SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error(PLAYER_SESSION_SECRET_ERROR);
  }

  return secret;
}

export function isMissingPlayerSessionSecret(error: unknown) {
  return error instanceof Error && error.message === PLAYER_SESSION_SECRET_ERROR;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function readCookieFromHeader(headerValue: string | null, name: string) {
  if (!headerValue) {
    return null;
  }

  const match = headerValue
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

export function buildPlayerRouteKey(roleId: number, zoneId: number) {
  return `${roleId}-${zoneId}`;
}

export function createPlayerSession({
  jwt,
  roleId,
  token = null,
  zoneId,
}: CreatePlayerSessionOptions): PlayerSession {
  const issuedAt = Date.now();

  return {
    expiresAt: issuedAt + PLAYER_SESSION_MAX_AGE * 1000,
    issuedAt,
    jwt,
    roleId,
    token,
    zoneId,
  };
}

export function serializePlayerSession(session: PlayerSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function parsePlayerSessionValue(value: string | null | undefined): PlayerSession | null {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<PlayerSession>;

    if (
      typeof parsed.jwt !== "string" ||
      typeof parsed.roleId !== "number" ||
      typeof parsed.zoneId !== "number" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      return null;
    }

    return {
      expiresAt: parsed.expiresAt,
      issuedAt: parsed.issuedAt,
      jwt: parsed.jwt,
      roleId: parsed.roleId,
      token: typeof parsed.token === "string" ? parsed.token : null,
      zoneId: parsed.zoneId,
    };
  } catch {
    return null;
  }
}

export async function getPlayerSession() {
  const cookieStore = await cookies();
  return parsePlayerSessionValue(cookieStore.get(PLAYER_SESSION_COOKIE)?.value);
}

export function getPlayerSessionFromRequest(request: NextRequest | Request) {
  const cookieValue = "cookies" in request && typeof request.cookies?.get === "function"
    ? request.cookies.get(PLAYER_SESSION_COOKIE)?.value
    : readCookieFromHeader(request.headers.get("cookie"), PLAYER_SESSION_COOKIE);

  return parsePlayerSessionValue(cookieValue);
}

export async function setPlayerSession(session: PlayerSession) {
  const cookieStore = await cookies();

  cookieStore.set(PLAYER_SESSION_COOKIE, serializePlayerSession(session), {
    httpOnly: true,
    maxAge: PLAYER_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearPlayerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PLAYER_SESSION_COOKIE);
}