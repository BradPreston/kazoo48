import type { ReactNode } from "react";
import { ctaClassName, type ButtonVariant } from "./buttonStyles";

type ButtonProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  external?: boolean;
  variant?: ButtonVariant;
};

export default function Button({
  href,
  children,
  icon,
  external,
  variant = "primary",
}: ButtonProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={ctaClassName(variant)}
    >
      {icon}
      {children}
    </a>
  );
}
