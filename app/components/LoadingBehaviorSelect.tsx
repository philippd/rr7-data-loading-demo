import type { PageLoadingBehavior } from "~/utils/loading";

const OPTIONS: PageLoadingBehavior[] = ["fast", "slow", "error", "slow-error"];

interface LoadingBehaviorSelectProps {
  label: string;
  value: string;
  onChange: (value: PageLoadingBehavior) => void;
}

export function LoadingBehaviorSelect({
  label,
  value,
  onChange,
}: LoadingBehaviorSelectProps) {
  return (
    <label className="flex items-center gap-2">
      {label}:
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PageLoadingBehavior)}
        className="border rounded px-2 py-1 dark:bg-gray-700"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
