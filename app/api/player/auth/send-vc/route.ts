import { MlbbApiError, getErrorMessage } from "@/lib/mlbb/errors";
import { sendPlayerVerificationCode } from "@/lib/player/api";

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
      zoneId?: number | string;
      zone_id?: number | string;
    };
    const roleId = parsePositiveInteger(payload.roleId ?? payload.role_id);
    const zoneId = parsePositiveInteger(payload.zoneId ?? payload.zone_id);

    if (!roleId || !zoneId) {
      return Response.json(
        {
          message: "A valid role ID and zone ID are required.",
        },
        {
          status: 400,
        }
      );
    }

    await sendPlayerVerificationCode(roleId, zoneId);

    return Response.json(
      {
        message: "Verification code sent to your MLBB in-game mail.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return Response.json(
      {
        message: getErrorMessage(error),
      },
      {
        status: error instanceof MlbbApiError ? (error.status ?? 502) : 500,
      }
    );
  }
}