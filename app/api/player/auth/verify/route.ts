import {
  buildPlayerRouteKey,
  createPlayerSession,
  isMissingPlayerSessionSecret,
  setPlayerSession,
} from "@/lib/auth/session";
import { MlbbApiError, getErrorMessage } from "@/lib/mlbb/errors";
import { loginPlayerWithVerificationCode } from "@/lib/player/api";

function parsePositiveInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number(value);
    return parsed > 0 ? parsed : null;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      roleId?: number | string;
      role_id?: number | string;
      verificationCode?: number | string;
      vc?: number | string;
      zoneId?: number | string;
      zone_id?: number | string;
    };
    const roleId = parsePositiveInteger(payload.roleId ?? payload.role_id);
    const zoneId = parsePositiveInteger(payload.zoneId ?? payload.zone_id);
    const verificationCode = parsePositiveInteger(payload.verificationCode ?? payload.vc);

    if (!roleId || !zoneId || !verificationCode) {
      return Response.json(
        {
          message: "Role ID, zone ID, and a valid 4-digit verification code are required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await loginPlayerWithVerificationCode(
      roleId,
      zoneId,
      verificationCode
    );
    const session = createPlayerSession(result);

    await setPlayerSession(session);

    return Response.json(
      {
        redirectTo: `/player/${buildPlayerRouteKey(result.roleId, result.zoneId)}`,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const status = isMissingPlayerSessionSecret(error)
      ? 503
      : error instanceof MlbbApiError
        ? (error.status ?? 502)
        : 500;
    const message = isMissingPlayerSessionSecret(error)
      ? "Player auth is not configured on this server yet. Set MLBB_PLAYER_SESSION_SECRET and restart Next.js."
      : getErrorMessage(error);

    return Response.json(
      {
        message,
      },
      {
        status,
      }
    );
  }
}