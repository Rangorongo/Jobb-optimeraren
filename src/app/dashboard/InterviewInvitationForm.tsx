"use client";

import { useState, useTransition } from "react";
import { submitInterviewInvitation } from "./actions";

export function InterviewInvitationForm({
  jobMatchId,
  onGuideReady,
}: {
  jobMatchId: string;
  onGuideReady: (guideContent: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium underline"
      >
        Fått intervju?
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Klistra in intervjukallelsen här..."
        className="min-h-[80px] rounded border border-black/[.1] p-2 text-sm dark:border-white/[.15] dark:bg-transparent"
      />
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                const guideContent = await submitInterviewInvitation(
                  jobMatchId,
                  text,
                );
                onGuideReady(guideContent);
                setOpen(false);
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Kunde inte generera intervjuguiden",
                );
              }
            });
          }}
          className="rounded-full bg-black px-4 py-2 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {isPending ? "Genererar guide..." : "Skapa intervjuguide"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs underline"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
