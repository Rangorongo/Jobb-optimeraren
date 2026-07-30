"use client";

import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useState, useTransition, type ReactNode } from "react";
import { updateJobMatchStatus } from "./actions";
import { JobMatchCard } from "./JobMatchCard";
import type { JobMatchDto, JobMatchStatus } from "./types";

const COLUMNS: { status: JobMatchStatus; label: string }[] = [
  { status: "FORESLAGEN", label: "Föreslagen" },
  { status: "ANSOKT", label: "Ansökt" },
  { status: "INTERVJU", label: "Intervju" },
  { status: "AVSLAG", label: "Avslag" },
];

export function KanbanBoard({ matches }: { matches: JobMatchDto[] }) {
  const [items, setItems] = useState(matches);
  const [, startTransition] = useTransition();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const jobMatchId = String(active.id);
    const newStatus = over.id as JobMatchStatus;

    setItems((prev) =>
      prev.map((m) => (m.id === jobMatchId ? { ...m, status: newStatus } : m)),
    );

    startTransition(() => {
      updateJobMatchStatus(jobMatchId, newStatus);
    });
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {COLUMNS.map((col) => (
          <Column key={col.status} status={col.status} label={col.label}>
            {items
              .filter((m) => m.status === col.status)
              .map((match) => (
                <DraggableCard key={match.id} match={match} />
              ))}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}

function Column({
  status,
  label,
  children,
}: {
  status: JobMatchStatus;
  label: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-col gap-3 rounded-lg border p-3 ${
        isOver
          ? "border-black bg-black/[.03] dark:border-white dark:bg-white/[.05]"
          : "border-black/[.1] dark:border-white/[.15]"
      }`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </h2>
      {children}
    </div>
  );
}

function DraggableCard({ match }: { match: JobMatchDto }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: match.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <JobMatchCard
        match={match}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
