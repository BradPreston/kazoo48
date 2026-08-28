import type { ReactNode } from "react";
import { PlayCircle, StopCircle } from "lucide-react";
import Highlight from "./Highlight";

function DateBadge({
  icon,
  label,
  date,
  rotate,
}: {
  icon: ReactNode;
  label: string;
  date: string;
  rotate: "left" | "right";
}) {
  return (
    <div className="relative flex flex-col items-center gap-1">
      <h3 className="text-xl font-semibold text-ink">{label}</h3>
      <div className="relative rounded-md border-2 border-ink bg-white px-6 py-2 text-2xl font-semibold shadow-[4px_4px_0_0_var(--color-ink)]">
        {date}
        <span
          className={`absolute -top-6 -left-6 text-secondary -z-10 ${
            rotate === "left" ? "-rotate-12" : "rotate-12"
          }`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function Filming() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink">
        Lights, camera action! <Highlight>Filming begins</Highlight>...
      </h2>

      <div className="flex items-center gap-10 sm:gap-16">
        <DateBadge
          icon={<PlayCircle size={48} />}
          label="Start"
          date="3/27/26"
          rotate="left"
        />
        <DateBadge
          icon={<StopCircle size={48} />}
          label="Finish"
          date="3/29/26"
          rotate="left"
        />
      </div>
    </section>
  );
}
