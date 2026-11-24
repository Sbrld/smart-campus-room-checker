import { useId } from 'react';
import { DAY_END_MINUTES } from '../constants';
import { minutesToLabel } from '../time';

interface TimeSelectorProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

/**
 * A numeric input that lets the user pick a time in 1-minute steps (0–1440).
 * Stores minutes-from-midnight internally. Empty or non-numeric input falls
 * back to the nearest valid bound so a NaN never reaches the checker.
 */
export default function TimeSelector({ label, value, onChange }: TimeSelectorProps) {
  const inputId = useId();

  const handleChange = (raw: string) => {
    if (raw.trim() === '') {
      onChange(0);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onChange(Math.min(DAY_END_MINUTES, Math.max(0, Math.round(parsed))));
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={0}
        max={DAY_END_MINUTES}
        step={1}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
      <span className="text-xs text-slate-400">{minutesToLabel(value)}</span>
    </div>
  );
}
