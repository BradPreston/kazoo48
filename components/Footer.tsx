import { FacebookIcon, InstagramIcon } from "./SocialIcons";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 pb-12">
      <div className="flex items-center gap-4">
        <a
          href="https://www.facebook.com/kazoo48film"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink text-ink transition-colors hover:bg-primary"
        >
          <FacebookIcon className="h-4 w-4" />
        </a>
        <a
          href="https://www.instagram.com/kazoo48hourfilm/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink text-ink transition-colors hover:bg-primary"
        >
          <InstagramIcon className="h-4 w-4" />
        </a>
      </div>
      <p className="text-center text-sm">
        Handcrafted with love by{" "}
        <a
          href="https://bradpreston.com"
          className="font-bold text-ink hover:underline"
        >
          Brad Preston
        </a>
      </p>
    </footer>
  );
}
