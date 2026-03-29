import {
  clearPlayerSession,
  getPlayerSessionFromRequest,
} from "@/lib/auth/session";
import { logoutPlayerSession } from "@/lib/player/api";

export async function POST(request: Request) {
  const session = getPlayerSessionFromRequest(request);

  try {
    if (session) {
      await logoutPlayerSession(session.jwt);
    }
  } catch {
    // Ignore upstream logout failures and clear the local session regardless.
  } finally {
    await clearPlayerSession();
  }

  return Response.json(
    {
      message: "Player session cleared.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}