// ============================================================
// ICÔNES — réseaux sociaux (traits fins) + motifs cosmiques
// ============================================================
// Toutes en SVG "currentColor" pour hériter la couleur du texte parent.

import type { CSSProperties } from "react";

type IconProps = { className?: string; style?: CSSProperties };

export function IconTwitch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 3.5 3 6.5v13h5V22l3-2.5h4l5-4.5V3.5H4Zm15 10.7-3 2.8h-4l-2.5 2.3v-2.3H6V5.5h13v8.7Z"
        fill="currentColor"
      />
      <path d="M15 8h1.6v4.5H15V8Zm-4.4 0H12v4.5h-1.4V8Z" fill="currentColor" />
    </svg>
  );
}

export function IconDiscord({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M18.5 5.5c-1.4-.65-2.9-1.1-4.5-1.35-.2.36-.42.85-.58 1.24a15 15 0 0 0-4.84 0c-.16-.4-.4-.88-.6-1.24-1.6.25-3.1.7-4.5 1.35C1.2 9.1.4 12.6.7 16.05a17 17 0 0 0 5.1 2.55c.42-.56.78-1.16 1.1-1.8-.6-.22-1.18-.5-1.72-.82.14-.1.28-.22.42-.32 3.32 1.5 6.9 1.5 10.18 0 .14.11.28.22.42.32-.54.32-1.12.6-1.72.82.32.64.68 1.24 1.1 1.8a17 17 0 0 0 5.1-2.55c.36-4-.66-7.46-2.18-10.55ZM8.9 13.9c-1 0-1.82-.9-1.82-2s.8-2 1.82-2 1.84.9 1.82 2c0 1.1-.8 2-1.82 2Zm6.2 0c-1 0-1.82-.9-1.82-2s.8-2 1.82-2 1.84.9 1.82 2c0 1.1-.8 2-1.82 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconTikTok({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14 3h2.2c.2 1.3 1.2 2.5 2.8 2.9v2.3c-1.1 0-2.1-.3-3-.9v5.8a4.7 4.7 0 1 1-4-4.6v2.3a2.4 2.4 0 1 0 1.7 2.3V3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.3" cy="7.7" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconYouTube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="6.5" width="18" height="11" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 9.5v5l4.3-2.5-4.3-2.5Z" fill="currentColor" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 7 12 12.5 19.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLink({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9.5 14.5 14.5 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 7.5 12.3 6.2a3.2 3.2 0 0 1 4.5 4.5L15.5 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13 16.5 11.7 17.8a3.2 3.2 0 0 1-4.5-4.5L8.5 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconRocket({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2c2.8 1.8 4.5 5 4.5 8.5 0 2-.5 3.8-1.4 5.3L12 18l-3.1-2.2A10 10 0 0 1 7.5 10.5C7.5 7 9.2 3.8 12 2Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <circle cx="12" cy="9.5" r="1.6" fill="#06050B" />
      <path d="M8.3 14.5 6 17l2.8-.6M15.7 14.5 18 17l-2.8-.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.5 18.5 12 22l1.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconValorant({ className }: IconProps) {
  // Écusson tactique de la banque d'icônes (évoque Valorant sans reprendre son logo)
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2.5 20 6.8v6.1c0 4.1-3.4 7.4-8 8.6-4.6-1.2-8-4.5-8-8.6V6.8l8-4.3Z" fill="currentColor" fillOpacity={0.16} />
      <path d="M12 6.9v2M12 15.1v2M6.9 12h2M15.1 12h2" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="m12 11 1 1-1 1-1-1 1-1Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- Motifs cosmiques décoratifs ---------- */

export function IconStar4({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path
        d="M12 2c.3 3.6 1 6.9 3.4 8.6C13 12.3 12.3 15.6 12 19.2c-.3-3.6-1-6.9-3.4-8.6C11 8.9 11.7 5.6 12 2Z"
        fill="currentColor"
      />
      <path
        d="M2 12c3.6-.3 6.9-1 8.6-3.4C8.9 11 5.6 11.7 2 12Zm20 0c-3.6.3-6.9 1-8.6 3.4C15.1 13 18.4 12.3 22 12Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

export function IconMoonCrescent({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M15.5 3.5c-4.7.5-8 4.4-8 8.7 0 4.8 3.9 8.7 8.7 8.7 1.6 0 3.1-.4 4.4-1.2-1.9 1-4.2 1.5-6.5 1-4.4-.9-7.2-5.2-6.3-9.6.7-3.5 3.6-6 7-6.4a8.6 8.6 0 0 1 .7-1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconOrbit({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="20.5" cy="10.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconCrystal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3 19 9l-7 12L5 9 12 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M5 9h14M12 3v18" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function IconPlanetRing({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="12" r="5" fill="currentColor" opacity="0.9" />
      <ellipse cx="11" cy="12" rx="9" ry="2.6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// ── Icônes d'interface (traits fins + remplissage léger, même style que le cristal) ──

const trait = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="8.5" r="3.5" {...trait} fill="currentColor" fillOpacity="0.18" />
      <path d="M2.5 19.5c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5" {...trait} />
      <circle cx="17" cy="9.5" r="2.6" {...trait} opacity="0.7" />
      <path d="M17.5 14.2c2.2.3 3.7 2 4 4.8" {...trait} opacity="0.7" />
    </svg>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" {...trait} fill="currentColor" fillOpacity="0.12" />
      <circle cx="12" cy="12" r="3" {...trait} fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

export function IconTrophy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" {...trait} fill="currentColor" fillOpacity="0.18" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 4M17 6h2.5a2.5 2.5 0 0 1-2.6 4M12 14v3M8.5 20h7M9.5 17h5v3h-5z" {...trait} />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" {...trait} fill="currentColor" fillOpacity="0.12" />
      <path d="M12 7v5l3.2 2" {...trait} />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" {...trait} fill="currentColor" fillOpacity="0.12" />
      <path d="M3.5 10h17M8 3v4M16 3v4" {...trait} />
      <circle cx="12" cy="14.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconHeart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" {...trait} fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export function IconGamepad({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 7h10a5 5 0 0 1 4.7 6.7l-1 2.8a2.3 2.3 0 0 1-3.9.7L15 15H9l-1.8 2.2a2.3 2.3 0 0 1-3.9-.7l-1-2.8A5 5 0 0 1 7 7Z" {...trait} fill="currentColor" fillOpacity="0.15" />
      <path d="M8 10v3M6.5 11.5h3" {...trait} />
      <circle cx="15.5" cy="10.6" r="1" fill="currentColor" />
      <circle cx="17.3" cy="12.6" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20V4M4 20h16" {...trait} />
      <path d="M7.5 15.5 11 12l3 2.5 5.5-6" {...trait} />
      <circle cx="19.5" cy="8.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconRobot({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="7" width="16" height="12" rx="4.5" {...trait} fill="currentColor" fillOpacity="0.15" />
      <path d="M12 7V4" {...trait} />
      <circle cx="12" cy="3.2" r="1.2" fill="currentColor" />
      <circle cx="9.3" cy="12.8" r="1.4" fill="currentColor" />
      <circle cx="14.7" cy="12.8" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" {...trait} />
    </svg>
  );
}
