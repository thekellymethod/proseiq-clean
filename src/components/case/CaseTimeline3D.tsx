"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";

type EventRow = {
  id: string;
  event_at: string;
  title: string;
  notes?: string | null;
  kind?: string | null;
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function isOverdueDeadline(e: EventRow) {
  return e.kind === "deadline" && new Date(e.event_at).getTime() < Date.now();
}

function kindColor(kind?: string | null) {
  switch (kind) {
    case "deadline":
      return "#fb7185"; // rose-400
    case "hearing":
      return "#60a5fa"; // blue-400
    case "filing":
      return "#34d399"; // emerald-400
    case "evidence":
      return "#fbbf24"; // amber-400
    default:
      return "#a78bfa"; // violet-400
  }
}

function laneY(kind?: string | null) {
  switch (kind) {
    case "deadline":
      return 1.6;
    case "hearing":
      return 0.8;
    case "filing":
      return 0;
    case "evidence":
      return -0.8;
    default:
      return -1.6;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computePositions(items: EventRow[]) {
  const parsed = items
    .map((e) => ({ e, t: new Date(e.event_at).getTime() }))
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => a.t - b.t);

  const minT = parsed[0]?.t ?? Date.now();
  const maxT = parsed[parsed.length - 1]?.t ?? minT;
  const span = Math.max(1, maxT - minT);

  // Keep things within a small-ish box for sane controls
  const xMin = -5;
  const xMax = 5;

  const nodes = parsed.map(({ e, t }, idx) => {
    const u = (t - minT) / span;
    const x = xMin + u * (xMax - xMin);

    // Small deterministic z jitter so overlapping dots are clickable
    const z = ((idx % 7) - 3) * 0.12;
    const y = laneY(e.kind ?? "note");

    return { ...e, x, y, z };
  });

  const axisPoints: Array<[number, number, number]> = [
    [xMin, 0, 0],
    [xMax, 0, 0],
  ];

  return { nodes, axisPoints };
}

function Node({
  e,
  selected,
  onSelect,
  onHover,
  onUnhover,
}: {
  e: EventRow & { x: number; y: number; z: number };
  selected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
  onUnhover: () => void;
}) {
  const overdue = isOverdueDeadline(e);
  const base = kindColor(e.kind);
  const color = overdue ? "#ef4444" : base;
  const r = selected ? 0.22 : 0.16;

  return (
    <group position={[e.x, e.y, e.z]}>
      <mesh
        onPointerOver={(ev) => {
          ev.stopPropagation();
          onHover(e.id);
        }}
        onPointerOut={(ev) => {
          ev.stopPropagation();
          onUnhover();
        }}
        onClick={(ev) => {
          ev.stopPropagation();
          onSelect(e.id);
        }}
      >
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial color={color} emissive={selected ? color : "#000000"} emissiveIntensity={selected ? 0.35 : 0} />
      </mesh>
      {selected ? (
        <Html distanceFactor={8} position={[0, r + 0.12, 0]} center>
          <div className="rounded-md border border-white/10 bg-black/70 px-2 py-1 text-xs text-white/90 shadow">
            <div className="font-medium">{e.title}</div>
            <div className="text-white/70">{fmt(e.event_at)}</div>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export default function CaseTimeline3D({
  caseId,
  onSelectEventId,
}: {
  caseId: string;
  onSelectEventId?: (id: string) => void;
}) {
  const [items, setItems] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/events`, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      const next = (j.items ?? j.events ?? []) as EventRow[];
      setItems(Array.isArray(next) ? next : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const { nodes, axisPoints } = React.useMemo(() => computePositions(items), [items]);
  const selected = React.useMemo(() => nodes.find((n) => n.id === selectedId) ?? null, [nodes, selectedId]);
  const hovered = React.useMemo(() => nodes.find((n) => n.id === hoveredId) ?? null, [nodes, hoveredId]);

  function select(id: string) {
    setSelectedId(id);
    onSelectEventId?.(id);
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white">3D timeline</h3>
          <p className="text-sm text-white/70">
            Visualize events in space. Click a node to inspect; edit events in the list view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/80 hover:bg-black/20"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative h-[520px] overflow-hidden rounded-xl border border-white/10 bg-black/20">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">Loading…</div>
            ) : null}

            <Canvas camera={{ position: [0, 2.2, 10], fov: 55 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 6, 4]} intensity={0.8} />

              <Line points={axisPoints} color="#94a3b8" lineWidth={1} />

              {/* Lane guides */}
              <Line points={[[-5, 1.6, -0.2], [5, 1.6, -0.2]]} color="#334155" />
              <Line points={[[-5, 0.8, -0.2], [5, 0.8, -0.2]]} color="#334155" />
              <Line points={[[-5, 0, -0.2], [5, 0, -0.2]]} color="#334155" />
              <Line points={[[-5, -0.8, -0.2], [5, -0.8, -0.2]]} color="#334155" />
              <Line points={[[-5, -1.6, -0.2], [5, -1.6, -0.2]]} color="#334155" />

              {nodes.map((e) => (
                <Node
                  key={e.id}
                  e={e}
                  selected={e.id === selectedId}
                  onSelect={select}
                  onHover={setHoveredId}
                  onUnhover={() => setHoveredId(null)}
                />
              ))}

              <OrbitControls enableDamping dampingFactor={0.12} rotateSpeed={0.6} maxPolarAngle={Math.PI / 2} />
            </Canvas>

            {hovered && hovered.id !== selectedId ? (
              <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-black/70 px-2 py-1 text-xs text-white/90">
                <div className="font-medium">{hovered.title}</div>
                <div className="text-white/70">{fmt(hovered.event_at)}</div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-xs text-white/60">Events</div>
          <div className="mt-1 text-sm text-white/90">{nodes.length}</div>

          <div className="mt-4 text-xs text-white/60">Selected</div>
          {selected ? (
            <div className="mt-2 space-y-2">
              <div className="text-sm font-medium text-white">{selected.title}</div>
              <div className="text-xs text-white/70">{fmt(selected.event_at)}</div>
              <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80">
                {selected.kind ?? "note"}
              </div>
              {selected.notes ? (
                <div className="text-sm text-white/80 whitespace-pre-wrap">{selected.notes}</div>
              ) : (
                <div className="text-sm text-white/50">No notes</div>
              )}

              {onSelectEventId ? null : (
                <div className="text-xs text-white/50">
                  Tip: switch to list view to edit/delete.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 text-sm text-white/50">Click an event node.</div>
          )}

          <div className="mt-4 text-xs text-white/60">Lanes</div>
          <div className="mt-2 space-y-1 text-xs text-white/70">
            <div className="flex items-center justify-between">
              <span>deadline</span>
              <span className="opacity-70">y=1.6</span>
            </div>
            <div className="flex items-center justify-between">
              <span>hearing</span>
              <span className="opacity-70">y=0.8</span>
            </div>
            <div className="flex items-center justify-between">
              <span>filing</span>
              <span className="opacity-70">y=0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>evidence</span>
              <span className="opacity-70">y=-0.8</span>
            </div>
            <div className="flex items-center justify-between">
              <span>note</span>
              <span className="opacity-70">y=-1.6</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

