import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vouchr-default-secret-key-that-is-very-long"
);

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: "EMPLOYEE" | "DIRECTOR" | "ACCOUNTS";
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    console.log("getCurrentUser: No session token cookie found");
    return null;
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    console.log("getCurrentUser: JWT verification failed for token:", token);
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        signatureUrl: true,
      },
    });
    if (!user) {
      console.log("getCurrentUser: No user found in db for id:", payload.userId);
    }
    return user;
  } catch (err) {
    console.error("getCurrentUser: Database query threw error:", err);
    return null;
  }
}
