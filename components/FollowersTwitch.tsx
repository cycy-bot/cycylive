"use client";

import { useEffect, useState } from "react";
import { IconTwitch } from "@/components/Icons";

export default function FollowersTwitch() {
  const [followers, setFollowers] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/followers")
      .then((r) => r.json())
      .then((data) => setFollowers(data.followers))
      .catch(() => {});
  }, []);

  if (!followers) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/10 px-4 py-1.5 text-sm text-ink-soft">
      <IconTwitch className="w-4 h-4 text-violet-light" />
      <strong className="text-ink">{followers.toLocaleString("fr-FR")}</strong> followers Twitch
    </span>
  );
}
