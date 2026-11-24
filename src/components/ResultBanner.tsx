import { CheckCircle2, XCircle } from 'lucide-react';
import type { AvailabilityResult } from '../types';

interface ResultBannerProps {
  result: AvailabilityResult | null;
}

export default function ResultBanner({ result }: ResultBannerProps) {
  if (!result) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
        Select a room and interval, then press Check Availability.
      </div>
    );
  }

  const isAvailable = result.available;

  return (
    <div
      role="status"
      data-reason-code={result.reasonCode}
      className={[
        'rounded-xl border p-4 sm:p-6',
        isAvailable
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {isAvailable ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={28} />
        ) : (
          <XCircle className="mt-0.5 shrink-0 text-red-600" size={28} />
        )}
        <div className="min-w-0">
          <p
            className={[
              'text-lg font-bold',
              isAvailable ? 'text-emerald-700' : 'text-red-700',
            ].join(' ')}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </p>
          <p
            className={[
              'mt-1 break-words text-sm',
              isAvailable ? 'text-emerald-600' : 'text-red-600',
            ].join(' ')}
          >
            {result.message}
          </p>
        </div>
      </div>
    </div>
  );
}
