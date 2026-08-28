"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Highlight from "./Highlight";

const films = [
  {
    title: "The Best of Us",
    poster: "/images/the-best-of-us.png",
    youtubeId: "I2Cl2sW0-Do",
  },
  {
    title: "Royal Flush",
    poster: "/images/royal-flush.png",
    youtubeId: "kPLfh1-S6D0",
  },
  {
    title: "Motherboard Loves You",
    poster: "/images/motherboard-loves-you.png",
    youtubeId: "F5tC3_6t5cs",
  },
  {
    title: "Choosing Eden",
    poster: "/images/choosing-eden.png",
    youtubeId: "1nNSpeESGTI",
  },
];

function useSlidesToShow() {
  const [slides, setSlides] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setSlides(3);
      else if (window.innerWidth >= 640) setSlides(2);
      else setSlides(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return slides;
}

export default function Inspiration() {
  const slidesToShow = useSlidesToShow();
  const maxIndex = Math.max(films.length - slidesToShow, 0);
  const [rawIndex, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const index = Math.min(rawIndex, maxIndex);

  useEffect(() => {
    if (paused || activeVideo) return;
    const id = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(id);
  }, [paused, activeVideo, maxIndex]);

  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeVideo]);

  const itemWidth = 100 / slidesToShow;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink">
        Looking for some <Highlight>inspiration</Highlight>?
      </h2>

      <div
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * itemWidth}%)` }}
          >
            {films.map((film) => (
              <div
                key={film.title}
                className="shrink-0 px-2"
                style={{ width: `${itemWidth}%` }}
              >
                <button
                  type="button"
                  onClick={() => setActiveVideo(film.youtubeId)}
                  aria-label={`Watch trailer for ${film.title}`}
                  className="group relative block w-full overflow-hidden rounded-xl border-2 border-ink shadow-[8px_8px_0_0_var(--color-ink)]"
                >
                  <Image
                    src={film.poster}
                    alt={film.title}
                    width={228}
                    height={404}
                    className="h-auto w-full"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/40">
                    <Play
                      size={48}
                      className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                      fill="currentColor"
                    />
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {maxIndex > 0 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setIndex((i) => (i === 0 ? maxIndex : i - 1))}
              className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-ink bg-primary p-2 shadow-[3px_3px_0_0_var(--color-ink)]"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setIndex((i) => (i === maxIndex ? 0 : i + 1))}
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 rounded-md border-2 border-ink bg-primary p-2 shadow-[3px_3px_0_0_var(--color-ink)]"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {maxIndex > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full border border-ink ${
                i === index ? "bg-ink" : "bg-white"
              }`}
            />
          ))}
        </div>
      )}

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
