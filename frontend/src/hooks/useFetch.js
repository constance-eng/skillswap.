import { useCallback, useEffect, useState } from "react";

// Runs `fetcher` whenever `deps` change, tracking loading/error/data the same
// way every page in this app needs to. `fetcher` receives an `isCancelled()`
// check so callers can bail out on stale responses after unmount or a rapid
// dep change (the same guard every page was hand-rolling with a `cancelled`
// flag). `reload` lets a page re-trigger the same fetch, e.g. from a retry
// button, without duplicating the effect body.
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher({ isCancelled: () => cancelled })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  return { data, error, loading, reload };
}
