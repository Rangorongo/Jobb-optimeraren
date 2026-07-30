"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

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
        <span className="text-sm font-medium">Lösenord</span>
        <input
          name="password"
          type="password"
          required
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
        {isPending ? "Loggar in..." : "Logga in"}
      </button>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Inget konto än? <a href="/signup" className="underline">Skapa konto</a>
      </p>
    </form>
  );
}
