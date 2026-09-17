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
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 5h4.2L17 15.8V19h-4.2L3 8.2V5Z"
        fill="currentColor"
      />
      <path
        d="M13 5h8v3.2L14 16v-4.4L18.4 7H13V5Z"
        fill="currentColor"
        opacity="0.7"
      />
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
