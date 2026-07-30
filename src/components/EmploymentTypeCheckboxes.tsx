import { EMPLOYMENT_TYPE_OPTIONS } from "@/lib/employment-types";

export function EmploymentTypeCheckboxes({
  name,
  defaultValues = [],
}: {
  name: string;
  defaultValues?: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            defaultChecked={defaultValues.includes(opt.value)}
          />
          {opt.label}
        </label>
      ))}
      <p className="text-xs text-zinc-500">
        Lämna alla omarkerade för att inkludera alla anställningstyper.
      </p>
    </div>
  );
}
