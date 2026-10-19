/**
 * Single source of truth for the current festival's dates, venue, and
 * registration state. When filming/premiere dates get announced (or
 * registration opens), flip the flag(s) below and fill in the real values —
 * every component that needs to switch between "TBD" and the real info
 * reads from here instead of being hand-edited/commented out individually.
 */
export const eventConfig = {
  // Whether the filming and premiere dates/venue/tickets have been
  // announced. When false, components show "TBD" and omit ticket/map
  // buttons and structured data that would otherwise advertise a real date.
  isScheduled: false,

  // Whether the registration form is open to the public. Kept independent
  // of `isScheduled` since registration may open on its own timeline.
  registrationOpen: false,

  filming: {
    start: "3/27/26",
    finish: "3/29/26",
  },

  premiere: {
    date: "4/23/26",
    isoStart: "2026-04-23T19:00:00-04:00",
    description: "Come see the show on April 23rd at GQT Kalamazoo 10 at 7 pm.",
  },

  venue: {
    name: "GQT Kalamazoo 10",
    mapsUrl: "https://maps.app.goo.gl/HfHovWfLeCHgre8P6",
    address: {
      streetAddress: "820 Maple Hill Dr",
      addressLocality: "Kalamazoo",
      addressRegion: "MI",
      postalCode: "49009",
      addressCountry: "US",
    },
  },

  ticketsUrl:
    "https://www.eventbrite.com/e/kazoo-48-2026-premiere-awards-tickets-1986842072122",
} as const;
