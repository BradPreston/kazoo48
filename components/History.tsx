import Highlight from "./Highlight";
import Button from "./Button";

export default function History() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-ink">
        How about a little <Highlight>history</Highlight>!
      </h2>

      <div className="flex max-w-2xl flex-col gap-4">
        <p>
          We&rsquo;re a non-profit film festival held in Kalamazoo, MI.
          Founded in 2019, we&rsquo;ve been blessed to meet some of the most
          talented filmmakers, both amateur and professional. The show gets
          bigger and better year after year bringing in more and more
          filmmakers.
        </p>
        <p>
          The show originally aired in the Kalamazoo Institute of Arts (KIA),
          but the show gained so much popularity that we had to move the
          venue. In 2024, Kazoo 48 filled a theater at the GQT Kalamazoo 10!
        </p>
        <p>If you have any questions, we are happy to chat!</p>
      </div>

      <Button href="/contact-us">Send us an Email</Button>
    </section>
  );
}
