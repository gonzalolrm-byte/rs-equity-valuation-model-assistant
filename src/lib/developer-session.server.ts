import { useSession } from "@tanstack/react-start/server";

export const developerSessionConfig = {
  password: process.env["SESSION_SECRET"] ?? "dev-only-fallback-session-secret-000000",
  name: "developer-gate",
  maxAge: 60 * 60 * 12,
  cookie: { httpOnly: true, secure: true, sameSite: "none" as const, partitioned: true, path: "/" },
};

export type GateSession = { unlocked?: boolean };

/** Throws unless the caller has unlocked the Developer Console. */
export async function requireDeveloper() {
  const session = await useSession<GateSession>(developerSessionConfig);
  if (session.data.unlocked !== true) {
    throw new Error("Developer Console is locked. Unlock it with the passcode first.");
  }
}
