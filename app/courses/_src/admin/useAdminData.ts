"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, envReady } from "../lib/supabase";

/** Generic loader: fetches a table once and exposes a manual refetch. */
export function useAdminTable<T>(
  table: string,
  order: { column: string; ascending: boolean },
): { rows: T[] | null; error: string | null; refetch: () => void } {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!envReady) {
      setError("Supabase is not configured yet.");
      setRows([]);
      return;
    }
    supabase()
      .from(table)
      .select("*")
      .order(order.column, { ascending: order.ascending })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        setRows((data ?? []) as T[]);
      });
  }, [table, order.column, order.ascending, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { rows, error, refetch };
}
