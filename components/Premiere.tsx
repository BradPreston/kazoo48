import { Film, MapPin, Ticket } from "lucide-react";
import Highlight from "./Highlight";
import Button from "./Button";
import JsonLd from "./JsonLd";
import { eventConfig } from "@/lib/event-config";

const { isScheduled, premiere, venue, ticketsUrl } = eventConfig;

// Only advertise structured data once there's a real date/offer to back it
// up — publishing a ScreeningEvent with a placeholder date is worse than
// omitting it.
const premiereJsonLd = isScheduled
  ? {
      "@context": "https://schema.org",
      "@type": "ScreeningEvent",
      name: "Kazoo 48 2026 Premiere & Awards",
      description: premiere.description,
      image: "https://kazoo48.com/images/kazoo48-logo.webp",
      startDate: premiere.isoStart,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "MovieTheater",
        name: venue.name,
        address: {
          "@type": "PostalAddress",
          ...venue.address,
        },
      },
      organizer: {
        "@type": "Organization",
        name: "Kazoo 48",
        url: "https://kazoo48.com",
      },
      offers: {
        "@type": "Offer",
        url: ticketsUrl,
        availability: "https://schema.org/InStock",
      },
    }
  : null;

export default function Premiere() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-16 text-center">
      {premiereJsonLd && <JsonLd data={premiereJsonLd} />}
      <h2 className="text-2xl font-semibold text-ink">
        Grab your <Highlight>popcorn</Highlight> and your drinks!
      </h2>

      <div className="relative flex flex-col items-center gap-1">
        <h3 className="text-xl font-semibold text-ink">Premiere</h3>
        <div className="relative rounded-md border-2 border-ink bg-white px-6 py-2 text-2xl font-semibold shadow-[4px_4px_0_0_var(--color-ink)] transition-transform duration-300">
          {isScheduled ? premiere.date : "TBD"}
          <span className="absolute -top-6 -left-6 -rotate-12 text-secondary -z-10">
            <Film size={48} />
          </span>
        </div>
      </div>

      {isScheduled && (
        <>
          <p>{premiere.description}</p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button href={ticketsUrl} icon={<Ticket size={20} />} external>
              Purchase Tickets
            </Button>
            <Button href={venue.mapsUrl} icon={<MapPin size={20} />} external>
              {venue.name}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
