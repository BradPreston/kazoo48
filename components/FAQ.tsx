"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Highlight from "./Highlight";

const faqs = [
  {
    question: "Who can enter?",
    answer:
      "Anyone! Kazoo 48 is open to filmmakers of all experience levels, from first-timers to seasoned pros. Teams and solo filmmakers are both welcome.",
  },
  {
    question: "How much does it cost to enter?",
    answer:
      "Entry details and pricing are covered on the registration page. Keep an eye out for early registration discounts!",
  },
  {
    question: "What equipment do I need?",
    answer:
      "Whatever you've got! A smartphone camera works just as well as a professional rig. We care about your story, not your gear.",
  },
  {
    question: "When do I find out the challenge categories?",
    answer:
      "Categories are revealed at kickoff, right when your 48-hour clock starts. That's the fun part!",
  },
  {
    question: "Do I have to premiere in person?",
    answer:
      "We'd love to see you there! The premiere is a celebration of everyone's hard work, but if you can't make it, we'll make sure your film is still shown.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-md border-2 border-ink bg-white shadow-[6px_6px_0_0_var(--color-ink)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <h3 className="text-base font-semibold leading-tight">{question}</h3>
        <ChevronDown
          size={24}
          className={`shrink-0 text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-sm">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink">
        Got <Highlight>questions</Highlight>?
      </h2>

      <div className="flex w-full flex-col gap-4">
        {faqs.map((faq, index) => (
          <FAQItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
