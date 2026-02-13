"use client";

import React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

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

const LANE_CONFIG = [
  { kind: "deadline", y: 1.6, label: "Deadline", color: "#fb7185" },
  { kind: "hearing", y: 0.8, label: "Hearing", color: "#60a5fa" },
  { kind: "filing", y: 0, label: "Filing", color: "#34d399" },
  { kind: "evidence", y: -0.8, label: "Evidence", color: "#fbbf24" },
  { kind: "note", y: -1.6, label: "Note", color: "#a78bfa" },
] as const;

function computePositions(items: EventRow[]) {
  const parsed = items
    .map((e) => ({ e, t: new Date(e.event_at).getTime() }))
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => a.t - b.t);

  const minT = parsed[0]?.t ?? Date.now();
  const maxT = parsed[parsed.length - 1]?.t ?? minT;
  const span = Math.max(1, maxT - minT);

  const xMin = -5;
  const xMax = 5;

  const nodes = parsed.map(({ e, t }, idx) => {
    const u = (t - minT) / span;
    const x = xMin + u * (xMax - xMin);
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
  upcoming,
  onSelect,
  onHover,
  onUnhover,
}: {
  e: EventRow & { x: number; y: number; z: number };
  selected: boolean;
  upcoming: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
  onUnhover: () => void;
}) {
  const overdue = isOverdueDeadline(e);
  const base = kindColor(e.kind);
  const color = overdue ? "#ef4444" : base;
  const r = selected ? 0.22 : 0.16;

  // When selected: stay in same XY plane, enlarge in XZ plane and bring forward
  const zOffset = selected ? 2.5 : 0;
  const scale = selected ? 1.8 : 1;

  // Glow when selected or when this is the next upcoming future event
  const shouldGlow = selected || upcoming;
  const emissive = shouldGlow ? color : "#000000";
  const emissiveIntensity = selected ? 0.35 : upcoming ? 0.4 : 0;

  return (
    <group
      position={[e.x, e.y, e.z + zOffset]}
      scale={[scale, scale, scale]}
    >
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
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
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

function LaneLabel({
  y,
  label,
  color,
  count,
}: {
  y: number;
  label: string;
  color: string;
  count?: number;
}) {
  const displayLabel = count !== undefined && count > 0 ? `${label} (${count})` : label;
  return (
    <group position={[-7.2, y, -0.2]}>
      <Html center transform distanceFactor={12}>
        <div
          className="whitespace-nowrap text-xs font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          style={{ color }}
        >
          {displayLabel}
        </div>
      </Html>
    </group>
  );
}

const INITIAL_CAMERA = {
  position: [0, 2.2, 10] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  fov: 55,
};

function SceneController({
  controlsRef,
  onArrowKey,
  onEscape,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onArrowKey: (dir: "up" | "down" | "left" | "right") => void;
  onEscape: () => void;
}) {
  const { camera } = useThree();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        camera.position.set(...INITIAL_CAMERA.position);
        const ctrl = controlsRef.current;
        if (ctrl?.target) {
          ctrl.target.set(...INITIAL_CAMERA.target);
        }
        onEscape();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onArrowKey("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onArrowKey("down");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onArrowKey("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onArrowKey("right");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [camera, controlsRef, onArrowKey, onEscape]);

  return null;
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

  const controlsRef = React.useRef<OrbitControlsImpl | null>(null);

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

  // Re-check which event is next upcoming every 30s so glow moves when time passes
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const nextUpcomingId = React.useMemo(() => {
    const now = Date.now();
    const future = nodes
      .filter((n) => new Date(n.event_at).getTime() > now)
      .sort((a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime());
    return future[0]?.id ?? null;
  }, [nodes, tick]);

  const laneCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cfg of LANE_CONFIG) {
      counts[cfg.kind] = nodes.filter((n) => laneY(n.kind ?? "note") === cfg.y).length;
    }
    return counts;
  }, [nodes]);
  const selected = React.useMemo(() => nodes.find((n) => n.id === selectedId) ?? null, [nodes, selectedId]);
  const hovered = React.useMemo(() => nodes.find((n) => n.id === hoveredId) ?? null, [nodes, hoveredId]);

  const select = React.useCallback(
    (id: string) => {
      setSelectedId(id);
      onSelectEventId?.(id);
    },
    [onSelectEventId]
  );

  const handleEscape = React.useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleArrowKey = React.useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      if (nodes.length === 0) return;

      const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

      if (dir === "left" || dir === "right") {
        // Stay on same lane (same Y): only move along X within that lane
        const laneY = selectedNode?.y ?? 0;
        const sameLane = nodes.filter((n) => n.y === laneY).sort((a, b) => a.x - b.x);
        const idx = selectedId ? sameLane.findIndex((n) => n.id === selectedId) : -1;

        let nextIdx: number;
        if (dir === "left") {
          nextIdx = idx <= 0 ? 0 : idx - 1;
        } else {
          nextIdx = idx < 0 ? 0 : Math.min(sameLane.length - 1, idx + 1);
        }
        const nextId = sameLane[nextIdx]?.id;
        if (nextId) select(nextId);
        return;
      }

      // Up/Down: move to different lane (different line)
      const sortedByYThenX = [...nodes].sort((a, b) => {
        if (a.y !== b.y) return b.y - a.y; // higher Y first
        return a.x - b.x;
      });
      const currentIdx = selectedId ? sortedByYThenX.findIndex((n) => n.id === selectedId) : -1;
      const nextIdx =
        dir === "up"
          ? currentIdx < 0
            ? 0
            : Math.max(0, currentIdx - 1)
          : currentIdx < 0
            ? 0
            : Math.min(sortedByYThenX.length - 1, currentIdx + 1);
      const nextId = sortedByYThenX[nextIdx]?.id;
      if (nextId) select(nextId);
    },
    [nodes, selectedId, select]
  );

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white">3D timeline</h3>
          <p className="text-sm text-white/70">
            Visualize events in space. Click a node to inspect; use arrow keys to navigate; ESC to reset view.
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

            <Canvas camera={{ position: INITIAL_CAMERA.position, fov: INITIAL_CAMERA.fov }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 6, 4]} intensity={0.8} />

              <SceneController
                controlsRef={controlsRef}
                onArrowKey={handleArrowKey}
                onEscape={handleEscape}
              />

              <Line points={axisPoints} color="#94a3b8" lineWidth={1} />

              {LANE_CONFIG.map((cfg) => (
                <React.Fragment key={cfg.kind}>
                  <Line
                    points={[
                      [-5, cfg.y, -0.2],
                      [5, cfg.y, -0.2],
                    ]}
                    color={cfg.color}
                  />
                  <LaneLabel
                    y={cfg.y}
                    label={cfg.label}
                    color={cfg.color}
                    count={laneCounts[cfg.kind]}
                  />
                </React.Fragment>
              ))}

              {nodes.map((e) => (
                <Node
                  key={e.id}
                  e={e}
                  selected={e.id === selectedId}
                  upcoming={e.id === nextUpcomingId}
                  onSelect={select}
                  onHover={setHoveredId}
                  onUnhover={() => setHoveredId(null)}
                />
              ))}

              <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.12}
                rotateSpeed={0.6}
                maxPolarAngle={Math.PI / 2}
              />
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
                <div className="text-xs text-white/50">Tip: switch to list view to edit/delete.</div>
              )}
            </div>
          ) : (
            <div className="mt-2 text-sm text-white/50">Click an event node or use arrow keys.</div>
          )}
        </aside>
      </div>
    </section>
  );
}
