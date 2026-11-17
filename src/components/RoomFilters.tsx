import { MAX_ATTENDEES } from '@/lib/roomFilters';

interface RoomFiltersProps {
  attendeesInput: string;
  attendeesError: string | null;
  equipmentOptions: string[];
  selectedEquipment: string[];
  hasActiveFilters: boolean;
  onAttendeesChange: (value: string) => void;
  onEquipmentToggle: (item: string) => void;
  onClear: () => void;
}

export default function RoomFilters({
  attendeesInput,
  attendeesError,
  equipmentOptions,
  selectedEquipment,
  hasActiveFilters,
  onAttendeesChange,
  onEquipmentToggle,
  onClear,
}: RoomFiltersProps) {
  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold">Filter rooms</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 rounded focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="attendees" className="block text-sm font-medium mb-1.5">
            Number of attendees
          </label>
          <input
            id="attendees"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_ATTENDEES}
            step={1}
            placeholder="Any"
            value={attendeesInput}
            onChange={(e) => onAttendeesChange(e.target.value)}
            aria-invalid={attendeesError ? true : undefined}
            aria-describedby={attendeesError ? 'attendees-error' : undefined}
            className={[
              'w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500',
              attendeesError ? 'border-red-400' : 'border-slate-300',
            ].join(' ')}
          />
          {attendeesError && (
            <p id="attendees-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {attendeesError}
            </p>
          )}
        </div>

        <fieldset className="sm:col-span-2 min-w-0">
          <legend className="block text-sm font-medium mb-1.5">Required equipment</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {equipmentOptions.map((item) => {
              const id = `equipment-${item.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <label
                  key={item}
                  htmlFor={id}
                  className="inline-flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={selectedEquipment.includes(item)}
                    onChange={() => onEquipmentToggle(item)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/40"
                  />
                  {item}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
