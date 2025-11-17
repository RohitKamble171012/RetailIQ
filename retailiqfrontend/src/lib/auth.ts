// src/lib/auth.ts
import { getIdToken } from "firebase/auth";
import { auth } from "./firebase";

export async function sendTokenToBackend(user: any) {
  try {
    const token = await getIdToken(user, true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verifyToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to verify user on server");

    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
}
