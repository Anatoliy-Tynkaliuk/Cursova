"use client";

import { useEffect, useState } from "react";
import { getChildBadgesPublic, type ChildBadgeItem } from "@/lib/endpoints";

export function useChildBadges(childProfileId: number | null) {
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childProfileId) return;
    async function load() {
      try {
        const data = await getChildBadgesPublic(childProfileId);
        setBadges(data.badges);
        setFinishedAttempts(data.finishedAttempts);
        setTotalStars(data.totalStars ?? data.finishedAttempts);
      } catch (e: any) { setError(e?.message ?? "Error"); }
    }
    void load();
  }, [childProfileId]);

  return { badges, finishedAttempts, totalStars, error };
}
