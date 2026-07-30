"use client";

import { useState } from "react";
import { GYMNASIEPROGRAM } from "@/lib/gymnasieprogram";
import type { EducationLevel } from "@/lib/preferences-form";

const EDUCATION_LEVEL_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "GYMNASIUM", label: "Gymnasium" },
  { value: "UNIVERSITY", label: "Universitet/Högskola" },
  { value: "FOLKHOGSKOLA", label: "Folkhögskola" },
];

export function StudentInfoFields({
  defaultIsStudent = false,
  defaultEducationLevel = null,
  defaultGymnasieProgram = "",
  defaultEducationName = "",
  defaultInstitutionName = "",
}: {
  defaultIsStudent?: boolean;
  defaultEducationLevel?: EducationLevel | null;
  defaultGymnasieProgram?: string;
  defaultEducationName?: string;
  defaultInstitutionName?: string;
}) {
  const [isStudent, setIsStudent] = useState(defaultIsStudent);
  const [level, setLevel] = useState<EducationLevel | null>(
    defaultEducationLevel,
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isStudent"
          value="true"
          checked={isStudent}
          onChange={(e) => setIsStudent(e.target.checked)}
        />
        Jag är student
      </label>

      {isStudent && (
        <div className="flex flex-col gap-3 border-l border-black/[.1] pl-4 dark:border-white/[.15]">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Utbildningsnivå</span>
            <div className="flex flex-col gap-1">
              {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="educationLevel"
                    value={opt.value}
                    checked={level === opt.value}
                    onChange={() => setLevel(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {level === "GYMNASIUM" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Gymnasieinriktning</span>
              <select
                name="gymnasieProgram"
                defaultValue={defaultGymnasieProgram}
                className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
              >
                <option value="">Välj program...</option>
                {GYMNASIEPROGRAM.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </label>
          )}

          {(level === "UNIVERSITY" || level === "FOLKHOGSKOLA") && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Utbildningens namn</span>
                <input
                  name="educationName"
                  defaultValue={defaultEducationName}
                  placeholder="T.ex. Civilingenjör Datateknik"
                  className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {level === "FOLKHOGSKOLA" ? "Folkhögskola" : "Universitet/Högskola"}
                </span>
                <input
                  name="institutionName"
                  defaultValue={defaultInstitutionName}
                  placeholder={
                    level === "FOLKHOGSKOLA" ? "T.ex. Sigtuna folkhögskola" : "T.ex. KTH"
                  }
                  className="rounded border border-black/[.1] px-3 py-2 dark:border-white/[.15] dark:bg-transparent"
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}
