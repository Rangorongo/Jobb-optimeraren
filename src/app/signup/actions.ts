"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export type SignupState = { error: string | null };

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "Fyll i e-post och lösenord." };
  }
  if (password.length < 8) {
    return { error: "Lösenordet måste vara minst 8 tecken." };
  }
  if (password !== confirmPassword) {
    return { error: "Lösenorden matchar inte." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Det finns redan ett konto med den e-postadressen." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, passwordHash, authProvider: "credentials" },
  });

  // signIn() redirects internally on success (throws a Next.js redirect
  // signal) - do not wrap this call in try/catch or the redirect breaks.
  await signIn("credentials", { email, password, redirectTo: "/onboarding" });

  return { error: null };
}
