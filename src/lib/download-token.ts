import { SignJWT, jwtVerify } from "jose";

/**
 * Signed, short-lived download tokens. A user can only receive a token for a
 * file they've actually purchased (checked in the API route before signing),
 * and the token itself expires quickly so links can't be shared/reused
 * indefinitely — this is our "secure download URL" mechanism.
 */

const secret = () => new TextEncoder().encode(process.env.DOWNLOAD_TOKEN_SECRET);

export interface DownloadTokenPayload {
  userId: string;
  productFileId: string;
}

export async function signDownloadToken(payload: DownloadTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret());
}

export async function verifyDownloadToken(
  token: string
): Promise<DownloadTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.userId !== "string" || typeof payload.productFileId !== "string") {
      return null;
    }
    return { userId: payload.userId, productFileId: payload.productFileId };
  } catch {
    return null;
  }
}
