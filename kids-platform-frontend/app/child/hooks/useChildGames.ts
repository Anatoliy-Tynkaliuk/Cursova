"use client";

import { useCallback, useEffect, useState } from "react";
import { getGames, type GameListItem } from "@/lib/endpoints/games";

export function useChildGames(ageGroupCode: string | null) {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!ageGroupCode) return;
    setLoading(true);
    setError(null);
    try { setGames(await getGames(ageGroupCode)); }
    catch (e: any) { setError(e?.message ?? "Error"); }
    finally { setLoading(false); }
  }, [ageGroupCode]);

  useEffect(() => { void reload(); }, [reload]);

  return { games, loading, error, reload };
}
