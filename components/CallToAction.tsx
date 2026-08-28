import Highlight from "./Highlight";
import Button from "./Button";

export default function CallToAction() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-ink">
        Ready to <Highlight>enter the show</Highlight>?
      </h2>
      <p>What are you waiting for? The show can&rsquo;t start without you!</p>
      <Button href="/register">Register</Button>
    </section>
  );
}
