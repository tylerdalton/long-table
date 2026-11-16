// Signed "you know the family passcode" cookie. Uses Web Crypto so it runs in
// both the proxy and server actions. Changing FAMILY_PASSCODE logs everyone out.

export const AUTH_COOKIE = "lt_auth";
export const MEMBER_COOKIE = "lt_member";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 400; // ~13 months; they visit once or twice a year

const enc = new TextEncoder();

async function hmac(message: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET");
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function payload(exp: number) {
  return `auth:${exp}:${process.env.FAMILY_PASSCODE ?? ""}`;
}

export async function createAuthToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + AUTH_MAX_AGE;
  return `${exp}.${await hmac(payload(exp))}`;
}

export async function verifyAuthToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now() / 1000) return false;
  const expected = await hmac(payload(exp));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
