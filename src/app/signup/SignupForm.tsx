"use client";

import { useActionState } from "react";
import { signup, type SignupState } from "./actions";

const initialState: SignupState = { error: null };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">E-post</span>
        <input
          name="email"
          type="email"
          required
          className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Lösenord (minst 8 tecken)</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Bekräfta lösenord</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
        />
      </label>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-black px-5 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending ? "Skapar konto..." : "Skapa konto"}
      </button>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Har du redan ett konto? <a href="/login" className="underline">Logga in</a>
      </p>
    </form>
  );
}
