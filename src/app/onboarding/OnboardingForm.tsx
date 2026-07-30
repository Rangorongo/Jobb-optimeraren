"use client";

import { useActionState } from "react";
import { MunicipalityPicker } from "@/components/MunicipalityPicker";
import { EmploymentTypeCheckboxes } from "@/components/EmploymentTypeCheckboxes";
import { StudentInfoFields } from "@/components/StudentInfoFields";
import { submitOnboarding, type OnboardingState } from "./actions";

const initialState: OnboardingState = { error: null };

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(
    submitOnboarding,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Roller (kommaseparerat)</span>
        <input
          name="roles"
          placeholder="Frontend-utvecklare, Projektledare"
          className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
          required
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Kommuner</span>
        <MunicipalityPicker name="municipalityIds" />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Typ av anställning</span>
        <EmploymentTypeCheckboxes name="employmentTypes" />
      </div>

      <StudentInfoFields />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Master-CV (PDF)</span>
        <input name="cv" type="file" accept="application/pdf" required />
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
        {isPending ? "Sparar..." : "Kom igång"}
      </button>
    </form>
  );
}
