"use client";

import { useEffect, useState } from "react";

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => { setIsAdmin(d.isAdmin); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { isAdmin, loading };
}
