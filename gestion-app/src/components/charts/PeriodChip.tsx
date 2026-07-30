import { ChevronDownIcon } from '@/components/layout/NavIcons';

export function PeriodChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-sm2 border border-mn-soft-border bg-mn-soft px-3 py-[7px] text-[12.5px] font-semibold text-mn-muted-4 transition-colors duration-150 hover:bg-mn-card-alt"
    >
      {label}
      <ChevronDownIcon />
    </button>
  );
}
