"use client";

import { useEffect, useState } from "react";

// A page's data comes from the server. A page built while the API was down
// reads it from the site's own /ledger routes instead.
export function useSiteData<T>(path: string, initial: T | null) {
  const [data, setData] = useState<T | null>(initial);
  const [failed, setFailed] = useState(false);

  const missing = initial == null;
  useEffect(() => {
    if (!missing) return;
    let alive = true;
    fetch(`/ledger/${path}.json`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: T) => alive && setData(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [path, missing]);

  return { data, failed };
}
