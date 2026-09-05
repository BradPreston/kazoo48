import { Film, MapPin, Ticket } from "lucide-react";
import Highlight from "./Highlight";
import Button from "./Button";
import JsonLd from "./JsonLd";

const premiereJsonLd = {
  "@context": "https://schema.org",
  "@type": "ScreeningEvent",
  name: "Kazoo 48 2026 Premiere & Awards",
  description:
    "Show date is TBD. Stay tuned!",
  image: "https://kazoo48.com/images/kazoo48-logo.webp",
  startDate: "2026-04-23T19:00:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "MovieTheater",
    name: "GQT Kalamazoo 10",
    address: {
      "@type": "PostalAddress",
      streetAddress: "820 Maple Hill Dr",
      addressLocality: "Kalamazoo",
      addressRegion: "MI",
      postalCode: "49009",
      addressCountry: "US",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Kazoo 48",
    url: "https://kazoo48.com",
  },
  offers: {
    "@type": "Offer",
    url: "https://www.eventbrite.com/e/kazoo-48-2026-premiere-awards-tickets-1986842072122",
    availability: "https://schema.org/InStock",
  },
};

export default function Premiere() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-16 text-center">
      <JsonLd data={premiereJsonLd} />
      <h2 className="text-2xl font-semibold text-ink">
        Grab your <Highlight>popcorn</Highlight> and your drinks!
      </h2>

      <div className="relative flex flex-col items-center gap-1">
        <h3 className="text-xl font-semibold text-ink">Premiere</h3>
        <div className="relative rounded-md border-2 border-ink bg-white px-6 py-2 text-2xl font-semibold shadow-[4px_4px_0_0_var(--color-ink)] transition-transform duration-300">
          TBD
          <span className="absolute -top-6 -left-6 -rotate-12 text-secondary -z-10">
            <Film size={48} />
          </span>
        </div>
      </div>

      {/* <p>Come see the show on April 23rd at GQT Kalamazoo 10 at 7 pm</p>

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
      </div> */}
    </section>
  );
}
