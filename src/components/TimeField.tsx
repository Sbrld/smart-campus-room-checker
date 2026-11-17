interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TimeField({ id, label, value, onChange }: TimeFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
      />
    </div>
  );
}
