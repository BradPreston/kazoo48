import { Film, MapPin, Ticket } from "lucide-react";
import Highlight from "./Highlight";
import Button from "./Button";

export default function Premiere() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-ink">
        Grab your <Highlight>popcorn</Highlight> and your drinks!
      </h2>

      <div className="relative flex flex-col items-center gap-1">
        <h3 className="text-xl font-semibold text-ink">Premiere</h3>
        <div className="relative rounded-md border-2 border-ink bg-white px-6 py-2 text-2xl font-semibold shadow-[4px_4px_0_0_var(--color-ink)]">
          4/23/26
          <span className="absolute -top-6 -left-6 -rotate-12 text-secondary -z-10">
            <Film size={48} />
          </span>
        </div>
      </div>

      <p>Come see the show on April 23rd at GQT Kalamazoo 10 at 7 pm</p>

      <div className="flex flex-wrap justify-center gap-4">
        <Button
          href="https://www.eventbrite.com/e/kazoo-48-2026-premiere-awards-tickets-1986842072122"
          icon={<Ticket size={20} />}
          external
        >
          Purchase Tickets
        </Button>
        <Button
          href="https://maps.app.goo.gl/HfHovWfLeCHgre8P6"
          icon={<MapPin size={20} />}
          external
        >
          GQT Kalamazoo 10
        </Button>
      </div>
    </section>
  );
}
