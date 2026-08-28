import { CheckSquare, Star, Timer } from "lucide-react";
import type { ReactNode } from "react";
import Highlight from "./Highlight";
import Button from "./Button";
import Reveal from "./Reveal";

const rules = [
  {
    icon: <Timer size={32} />,
    title: "Be between 1-6 minutes long",
    body: "That includes the opening and closing credits. No exceptions!",
  },
  {
    icon: <CheckSquare size={32} />,
    title: "Include all of the challenge categories",
    body: "The categories are: genre, line of dialogue, prop, location, and character.",
  },
  {
    icon: <Star size={32} />,
    title: "Have an estimated MPAA Rating",
    body: "Your film may be rated G, PG, PG-13, or R.",
  },
];

function RuleCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border-2 border-ink bg-white p-6 shadow-[6px_6px_0_0_var(--color-ink)] transition-transform duration-300 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[8px_8px_0_0_var(--color-ink)]">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-secondary text-secondary">
          {icon}
        </div>
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
      </div>
      <p className="text-sm">{children}</p>
    </div>
  );
}

export default function Rules() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink">
        Hold on, <Highlight>there are rules</Highlight>! Your film must...
      </h2>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {rules.map((rule, index) => (
          <Reveal key={rule.title} delay={index * 120}>
            <RuleCard icon={rule.icon} title={rule.title}>
              {rule.body}
            </RuleCard>
          </Reveal>
        ))}
      </div>

      <Button href="/images/kazoo48-rules.pdf" external>
        Download Rules
      </Button>
    </section>
  );
}
