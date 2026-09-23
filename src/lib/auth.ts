"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { adminAuth, adminDb } from "./firebase/admin";
import type { User } from "./types";

const SESSION_COOKIE = "__session"; // also read in proxy.ts
const SESSION_MS = 5 * 24 * 60 * 60 * 1000;

type Result = { user: User } | { error: string };

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  // ADMIN is never self-assignable; admins are created by `npm run seed`.
  role: z.enum(["CUSTOMER", "B2B", "DELIVERY"]),
  address: z
    .object({
      line: z.string().trim().min(3).max(120),
      area: z.string().trim().min(2).max(60),
      city: z.string().trim().min(2).max(60),
      pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    })
    .optional(),
});

async function loadUser(uid: string): Promise<User | null> {
  const snap = await adminDb().collection("users").doc(uid).get();
  return snap.exists ? ({ ...(snap.data() as Omit<User, "id">), id: uid }) : null;
}

// Called right after the browser creates the Firebase Auth account.
export async function registerProfile(idToken: string, input: z.input<typeof registerSchema>): Promise<Result> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, phone, role, address } = parsed.data;
  if (role !== "DELIVERY" && !address) return { error: "Delivery address is required" };

  try {
    const { uid, email } = await adminAuth().verifyIdToken(idToken);
    const ref = adminDb().collection("users").doc(uid);
    // Profile (and role) is written once; re-calling can't switch roles.
    if ((await ref.get()).exists) return { error: "Profile already exists" };

    const user: Omit<User, "id"> = {
      name,
      email: email ?? "",
      phone,
      role,
      addresses: address ? [{ id: "addr1", ...address, isDefault: true }] : [],
      walletBalance: 0,
      loyaltyPoints: 0,
    };
    await adminAuth().setCustomUserClaims(uid, { role });
    await ref.set({ ...user, createdAt: new Date().toISOString() });
    return { user: { ...user, id: uid } };
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || String(err);
    console.error("registerProfile error:", errorMsg);

    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      return {
        error:
          "Firebase Admin credentials (FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY) are missing in .env.local.",
      };
    }
    return { error: errorMsg || "Could not create profile. Please try again." };
  }
}

// Exchanges a fresh ID token for an httpOnly session cookie that proxy.ts verifies.
export async function createSession(idToken: string): Promise<Result> {
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return { error: "Please sign in again" };
    const user = await loadUser(decoded.uid);
    if (!user) return { error: "No profile found for this account. Please register." };

    const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MS });
    (await cookies()).set(SESSION_COOKIE, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MS / 1000,
    });
    return { user };
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || String(err);
    console.error("createSession error:", errorMsg);
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      return {
        error:
          "Firebase Admin credentials (FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY) are missing in .env.local.",
      };
    }
    return { error: errorMsg || "Login failed. Please try again." };
  }
}

export async function getSessionUser(): Promise<User | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const { uid } = await adminAuth().verifySessionCookie(cookie);
    return await loadUser(uid);
  } catch {
    return null;
  }
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
