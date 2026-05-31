"use client";

import type { SessionUser, Task, TaskStatus } from "@/lib/types";

const statusLabel: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
};

type TaskCardProps = {
  task: Task;
  currentUser: SessionUser;
  mode: "assigned" | "created";
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  busy: boolean;
};

export function TaskCard({
  task,
  currentUser,
  mode,
  onStatusChange,
  busy,
}: TaskCardProps) {
  const canUpdate = task.assigned_to === currentUser.id;
  const person = mode === "assigned" ? task.creator : task.assignee;
  const personLabel = mode === "assigned" ? "Created by" : "Assigned to";

  return (
    <article className="rounded-md border border-app-border bg-app-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base font-semibold leading-6 text-app-primary">
          {task.title}
        </h3>
        <span className="shrink-0 rounded border border-app-border px-2 py-1 text-xs text-app-secondary">
          {statusLabel[task.status]}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-app-secondary">
        {task.description || "No description"}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-app-border pt-3">
        <div className="min-w-0 text-sm text-app-secondary">
          <span>{personLabel}</span>{" "}
          <span className="text-app-primary">{person?.name || "Unknown"}</span>
        </div>

        <button
          type="button"
          disabled={!canUpdate || busy}
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          className="h-9 shrink-0 rounded-md border border-app-primary px-3 text-sm font-medium text-app-primary transition hover:bg-app-primary hover:text-app-bg disabled:hover:bg-transparent disabled:hover:text-app-primary"
        >
          {statusLabel[nextStatus[task.status]]}
        </button>
      </div>
    </article>
  );
}
