import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getSaved, saveItem, unsaveItem } from "../services/api";

export function useSaved() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(new Set());
  // Keep a ref in sync so toggleSave never reads stale state from a closure
  const savedIdsRef = useRef(new Set());

  useEffect(() => {
    savedIdsRef.current = savedIds;
  }, [savedIds]);

  useEffect(() => {
    if (!user?.user_id) { setSavedIds(new Set()); return; }
    let cancelled = false;
    setLoading(true);
    getSaved()
      .then(items => {
        if (cancelled) return;
        setSavedIds(prev => {
          const fromServer = new Set(items.map(i => String(i.item_id)));
          // Preserve in-flight optimistic toggles
          pendingRef.current.forEach(id => {
            if (prev.has(id)) fromServer.add(id);
            else fromServer.delete(id);
          });
          return fromServer;
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.user_id]); // stable primitive — won't re-run on every render

  // Stable reference: reads current state via ref, no [savedIds] dependency
  const toggleSave = useCallback(async (type, id, data) => {
    const strId = String(id);
    const isCurrentlySaved = savedIdsRef.current.has(strId);
    pendingRef.current.add(strId);

    if (isCurrentlySaved) {
      // Optimistic remove
      setSavedIds(prev => { const s = new Set(prev); s.delete(strId); return s; });
      try { await unsaveItem(strId); }
      catch { setSavedIds(prev => new Set(prev).add(strId)); } // rollback
      finally { pendingRef.current.delete(strId); }
    } else {
      // Optimistic add
      setSavedIds(prev => new Set(prev).add(strId));
      try { await saveItem(type, strId, data); }
      catch { setSavedIds(prev => { const s = new Set(prev); s.delete(strId); return s; }); } // rollback
      finally { pendingRef.current.delete(strId); }
    }
  }, []); // [] — stable reference, never recreated

  return { saved: savedIds, toggleSave, loading };
}
