"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import Highlight from "./Highlight";

const films = [
  {
    title: "Check-In",
    youtubeId: "SxOol4Pi7LM",
    year: 2026,
    award: "Best Amateur Picture"
  },
  {
    title: "Poker Night",
    youtubeId: "1Fq3Y-zbo24",
    year: 2026,
    award: "Best Use of Character"
  },
  {
    title: "Operation: Pomme De Terre",
    youtubeId: "MANIdVHTYEM",
    year: 2025,
    award: "Best Amateur Picture"
  },
  {
    title: "Shotgun",
    youtubeId: "fZXKASYVSX8",
    year: 2025,
    award: "Best Use of Prop"
  },
  {
    title: "The Best of Us",
    youtubeId: "I2Cl2sW0-Do",
    year: 2024,
    award: "Best Professional Picture"
  },
  {
    title: "Motherboard Loves You",
    youtubeId: "F5tC3_6t5cs",
    year: 2024,
    award: "Best Amateur Picture"
  },
  {
    title: "The Omelette",
    youtubeId: "62BqmnHfgK4",
    year: 2023,
    award: "Best Amateur Picture",
  },
  {
    title: "Choosing Eden",
    youtubeId: "1nNSpeESGTI",
    year: 2019,
    award: "Best Professional Picture"
  },
  
];

export default function Inspiration() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeVideo]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink">
        Looking for some <Highlight>inspiration</Highlight>?
      </h2>

      <div className="grid w-full grid-cols-2 gap-8 md:grid-cols-4">
        {films.map((film) => (
          <div className="relative" key={film.title}>
            <span className="absolute text-sm font-bold -top-2 -right-4 rotate-4 py-0 px-1 bg-secondary z-20 rounded border-2 border-ink">{film.award}</span>
            <button
              type="button"
              onClick={() => setActiveVideo(film.youtubeId)}
              aria-label={`Watch trailer for ${film.title}`}
              className="group relative block w-full overflow-hidden rounded-xl border-2 border-ink shadow-[8px_8px_0_0_var(--color-ink)] transition-all duration-300 hover:shadow-[10px_10px_0_0_var(--color-ink)]"
            >
              <Image
                src={`https://i.ytimg.com/vi/${film.youtubeId}/mqdefault.jpg`}
                alt={film.title}
                width={228}
                height={404}
                className="h-auto w-full aspect-2/3 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/40">
                <Play
                  size={48}
                  className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                  fill="currentColor"
                />
              </span>
              <div className="absolute bottom-0 left-0 bg-white text-left px-2 pb-1 rounded-lg border-ink border-2">
                <strong className="text-sm">{film.title}</strong>
                <p className="text-sm">{film.year}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative aspect-video w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setActiveVideo(null)}
              className="absolute -top-10 right-0 text-white"
            >
              <X size={28} />
            </button>
            <iframe
              className="h-full w-full rounded-md"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
              title="Film trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
