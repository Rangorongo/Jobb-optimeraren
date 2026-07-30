"use client";

import { useActionState } from "react";
import { MunicipalityPicker } from "@/components/MunicipalityPicker";
import { EmploymentTypeCheckboxes } from "@/components/EmploymentTypeCheckboxes";
import { StudentInfoFields } from "@/components/StudentInfoFields";
import type { EducationLevel } from "@/lib/preferences-form";
import { updateProfile, type ProfileState } from "./actions";

const initialState: ProfileState = { error: null };

export function ProfileForm({
  defaultRoles,
  defaultMunicipalityIds,
  defaultEmploymentTypes,
  defaultIsStudent,
  defaultEducationLevel,
  defaultGymnasieProgram,
  defaultEducationName,
  defaultInstitutionName,
  masterCvFileUrl,
}: {
  defaultRoles: string;
  defaultMunicipalityIds: string[];
  defaultEmploymentTypes: string[];
  defaultIsStudent: boolean;
  defaultEducationLevel: EducationLevel | null;
  defaultGymnasieProgram: string;
  defaultEducationName: string;
  defaultInstitutionName: string;
  masterCvFileUrl: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Roller (kommaseparerat)</span>
        <input
          name="roles"
          defaultValue={defaultRoles}
          className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
          required
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Kommuner</span>
        <MunicipalityPicker
          name="municipalityIds"
          defaultSelectedIds={defaultMunicipalityIds}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Typ av anställning</span>
        <EmploymentTypeCheckboxes
          name="employmentTypes"
          defaultValues={defaultEmploymentTypes}
        />
      </div>

      <StudentInfoFields
        defaultIsStudent={defaultIsStudent}
        defaultEducationLevel={defaultEducationLevel}
        defaultGymnasieProgram={defaultGymnasieProgram}
        defaultEducationName={defaultEducationName}
        defaultInstitutionName={defaultInstitutionName}
      />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Master-CV (PDF)</span>
        {masterCvFileUrl && (
          <a href={masterCvFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
            Visa nuvarande CV
          </a>
        )}
        <input name="cv" type="file" accept="application/pdf" />
        <span className="text-xs text-zinc-500">
          Ladda bara upp en fil om du vill ersätta ditt nuvarande CV.
        </span>
      </label>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-600" role="status">
          Profilen har uppdaterats.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-black px-5 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending ? "Sparar..." : "Spara ändringar"}
      </button>
    </form>
  );
}
