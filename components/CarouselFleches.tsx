"use client";

import { useRef } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/Icons";

export default function CarouselFleches({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function defiler(direction: -1 | 1) {
    ref.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className={`flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide ${className}`}
      >
        {children}
      </div>

      <button
        onClick={() => defiler(-1)}
        aria-label="Précédent"
        className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-void/90 border border-violet/30 text-ink-soft hover:text-ink hover:border-violet/50 hover:shadow-glow-sm transition-all"
      >
        <IconChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => defiler(1)}
        aria-label="Suivant"
        className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-void/90 border border-violet/30 text-ink-soft hover:text-ink hover:border-violet/50 hover:shadow-glow-sm transition-all"
      >
        <IconChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
