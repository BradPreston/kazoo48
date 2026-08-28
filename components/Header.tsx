"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/contact-us", label: "Contact us" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
      <Link href="/" className="shrink-0">
        <Image
          src="/images/kazoo48-logo.webp"
          alt="Kazoo 48 Hour Film Festival Logo"
          width={988}
          height={863}
          className="h-auto w-25 brightness-0 sm:w-37.5"
          priority
        />
      </Link>

      <nav className="hidden items-center gap-8 sm:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-semibold text-ink hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-md bg-cream text-ink sm:hidden"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full z-20 mx-auto flex w-full max-w-4xl flex-col gap-4 bg-cream px-6 py-6 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-semibold text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
