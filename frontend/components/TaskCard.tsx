"use client";

import { useState } from "react";

import type { SessionUser, Task, TaskStatus } from "@/lib/types";

const statusLabel: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const statusOptions: TaskStatus[] = ["pending", "in_progress", "completed"];

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
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const canUpdate = task.assigned_to === currentUser.id;
  const statusLocked = task.status === "completed";
  const person = mode === "assigned" ? task.creator : task.assignee;
  const personLabel = mode === "assigned" ? "Created by" : "Assigned to";
  const pendingStatusLabel = pendingStatus ? statusLabel[pendingStatus] : "";

  function handleStatusSelect(status: TaskStatus) {
    if (status === task.status) {
      return;
    }

    if (status === "in_progress" || status === "completed") {
      setPendingStatus(status);
      return;
    }

    onStatusChange(task.id, status);
  }

  function confirmStatusChange() {
    if (!pendingStatus) {
      return;
    }

    const status = pendingStatus;
    setPendingStatus(null);
    onStatusChange(task.id, status);
  }

  return (
    <>
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

          <label className="shrink-0">
            <span className="sr-only">Task status</span>
            <select
              value={task.status}
              disabled={!canUpdate || busy || statusLocked}
              onChange={(event) => handleStatusSelect(event.target.value as TaskStatus)}
              className="h-9 min-w-36 rounded-md border border-app-primary bg-app-surface px-3 text-sm font-medium text-app-primary outline-none transition hover:bg-app-bg focus:border-app-primary disabled:hover:bg-app-surface"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>

      {pendingStatus ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-bg/80 px-4">
          <div className="w-full max-w-sm rounded-md border border-app-border bg-app-surface p-5">
            <h2 className="text-base font-semibold text-app-primary">
              Mark as {pendingStatusLabel}?
            </h2>
            <p className="mt-2 text-sm leading-5 text-app-secondary">
              {pendingStatus === "completed"
                ? `This will mark "${task.title}" as completed and notify the creator. This cannot be changed later.`
                : `This will mark "${task.title}" as in progress.`}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingStatus(null)}
                className="h-10 rounded-md border border-app-border px-4 text-sm text-app-secondary transition hover:border-app-primary hover:text-app-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirmStatusChange}
                className="h-10 rounded-md bg-app-primary px-4 text-sm font-semibold text-app-bg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
