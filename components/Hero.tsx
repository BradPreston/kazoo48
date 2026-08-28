import Image from "next/image";
import Highlight from "./Highlight";
import Button from "./Button";

export default function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-12 px-6 pt-4 pb-12 md:grid-cols-2">
      <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left order-2 md:order-1">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          Can you make a movie in <Highlight>48 hours</Highlight>?
        </h1>
        <p className="max-w-md text-lg">
          Kazoo 48 is a film festival where you make a film in only 48 hours.
          Think you&rsquo;ve got what it takes?
        </p>
        <Button href="/register">Register</Button>
      </div>

      <div className="-skew-x-2 order-1 md:order-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-ink shadow-[8px_8px_0_0_var(--color-ink)]">
          <video
            className="h-full w-full object-cover brightness-75"
            src="/images/kazoo48-event.webm"
            autoPlay
            loop
            muted
            playsInline
          />
          <Image
            src="/images/kazoo48-logo.webp"
            alt="Kazoo 48 Hour Film Festival Logo"
            fetchPriority="high"
            loading="eager"
            width={988}
            height={863}
            className="absolute top-1/2 left-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    </section>
  );
}
