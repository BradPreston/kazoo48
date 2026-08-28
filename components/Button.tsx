import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  external?: boolean;
  variant?: "primary" | "secondary";
};

export default function Button({
  href,
  children,
  icon,
  external,
  variant = "primary",
}: ButtonProps) {
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-2 rounded-md border-2 border-ink ${bg} px-8 py-4 font-bold text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)]`}
    >
      {icon}
      {children}
    </a>
  );
}
