"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Fel e-post eller lösenord." };
    }
    // Rethrow the redirect signal (and any other unexpected error).
    throw err;
  }
}
