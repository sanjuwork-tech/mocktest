// Per-question time tracking for the exam player. Pure: the caller passes the clock reading (ms).
// `total` is everything known for a question (seeded from the server plus time banked here);
// `unsent` holds only the new time and visits not yet posted, so seeded time is never re-sent.

export type TimerDelta = { assignmentId: string; addMs: number; visits: number };

export function createQuestionTimer() {
  const total = new Map<string, number>();
  const unsent = new Map<string, { addMs: number; visits: number }>();
  let active: { id: string; since: number | null } | null = null;

  const add = (id: string, addMs: number, visits: number) => {
    const u = unsent.get(id) ?? { addMs: 0, visits: 0 };
    unsent.set(id, { addMs: u.addMs + addMs, visits: u.visits + visits });
  };
  const bank = (now: number) => {
    if (!active || active.since === null) return;
    const ms = Math.max(0, Math.round(now - active.since));
    active.since = now;
    if (ms > 0) {
      total.set(active.id, (total.get(active.id) ?? 0) + ms);
      add(active.id, ms, 0);
    }
  };

  return {
    /** Load saved totals from the server; a question already tracked here keeps its own total. */
    seed(saved: Record<string, number> = {}) {
      for (const [id, ms] of Object.entries(saved)) if (ms > 0 && !total.has(id)) total.set(id, ms);
    },
    /** Put a question on screen: bank the previous one, count a visit, run unless the tab is hidden. */
    show(id: string, now: number, hidden: boolean) {
      bank(now);
      active = { id, since: hidden ? null : now };
      add(id, 0, 1);
    },
    pause(now: number) {
      bank(now);
      if (active) active.since = null;
    },
    resume(now: number) {
      if (active) active.since = now;
    },
    bank,
    /** Milliseconds on a question, including the part still running. */
    elapsed(id: string, now: number) {
      const live = active && active.id === id && active.since !== null ? Math.max(0, now - active.since) : 0;
      return (total.get(id) ?? 0) + live;
    },
    hasUnsent: () => unsent.size > 0,
    /** Take the new time to post (capped per question) and clear it; give it back with `restore` on failure. */
    takeDeltas(now: number): TimerDelta[] {
      bank(now);
      const out = [...unsent].map(([assignmentId, u]) => ({
        assignmentId,
        addMs: Math.min(u.addMs, 600_000),
        visits: Math.min(u.visits, 50),
      }));
      unsent.clear();
      return out;
    },
    restore(deltas: TimerDelta[]) {
      for (const d of deltas) add(d.assignmentId, d.addMs, d.visits);
    },
  };
}

export function formatQuestionTime(ms: number) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
