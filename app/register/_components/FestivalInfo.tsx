import type { ReactNode } from "react";
import { Film, PlayCircle, StopCircle, Ticket } from "lucide-react";
import { env } from "@/lib/env";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-cream text-ink">
        {icon}
      </span>
      <div className="flex flex-col">
        <dt className="text-xs font-semibold tracking-wide text-ink/60 uppercase">
          {label}
        </dt>
        <dd className="text-lg font-bold text-ink">{value}</dd>
      </div>
    </div>
  );
}

export default function FestivalInfo() {
  const entryCost = currencyFormatter.format(env.REGISTRATION_FEE_CENTS / 100);

  return (
    <aside className="order-2 flex w-full flex-col gap-6 max-w-xl rounded-md border-2 mx-auto border-ink bg-white p-6 shadow-[6px_6px_0_0_var(--color-ink)] lg:sticky lg:top-8 lg:order-3 lg:col-start-2">
      <h2 className="text-xl font-bold text-ink">Festival Details</h2>

      <dl className="flex flex-col gap-4">
        <InfoRow
          icon={<PlayCircle size={28} />}
          label="Filming Starts"
          value="3/27/26"
        />
        <InfoRow
          icon={<StopCircle size={28} />}
          label="Filming Ends"
          value="3/29/26"
        />
        <InfoRow icon={<Film size={28} />} label="Premiere" value="4/23/26" />
      </dl>

      <div className="flex flex-col items-center gap-1 rounded-md border-2 border-ink bg-secondary px-4 py-4 text-center shadow-[3px_3px_0_0_var(--color-ink)]">
        <span className="flex items-center gap-1 text-xs font-bold tracking-wide text-ink/70 uppercase">
          <Ticket size={14} />
          Entry Cost
        </span>
        <span className="text-3xl font-bold text-ink">{entryCost}</span>
      </div>
    </aside>
  );
}
