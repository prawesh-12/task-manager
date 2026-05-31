"use client";

import { FormEvent, useMemo, useState } from "react";
import type { SessionUser, User } from "@/lib/types";

type NewTaskModalProps = {
  users: User[];
  currentUser: SessionUser;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    description: string;
    assigned_to: string;
  }) => Promise<void>;
};

export function NewTaskModal({
  users,
  currentUser,
  onClose,
  onSubmit,
}: NewTaskModalProps) {
  const assignableUsers = useMemo(
    () => users.filter((user) => user.id !== currentUser.id),
    [users, currentUser.id]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(assignableUsers[0]?.id || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!assignedTo) {
      setError("Choose an assignee.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        assigned_to: assignedTo,
      });
    } catch {
      setError("Task could not be created.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-bg/80 px-4">
      <div className="w-full max-w-lg rounded-md border border-app-border bg-app-surface">
        <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
          <h2 className="text-base font-semibold text-app-primary">New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-md border border-app-border text-app-secondary transition hover:border-app-primary hover:text-app-primary"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-2 block text-sm text-app-secondary">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full rounded-md border border-app-border bg-app-bg px-3 text-app-primary outline-none transition focus:border-app-primary"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-app-secondary">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-app-border bg-app-bg px-3 py-3 text-app-primary outline-none transition focus:border-app-primary"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-app-secondary">Assign To</span>
            <select
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              className="h-11 w-full rounded-md border border-app-border bg-app-bg px-3 text-app-primary outline-none transition focus:border-app-primary"
            >
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="text-sm text-app-primary">{error}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-app-border px-4 text-sm text-app-secondary transition hover:border-app-primary hover:text-app-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || assignableUsers.length === 0}
              className="h-10 rounded-md bg-app-primary px-4 text-sm font-semibold text-app-bg"
            >
              {saving ? "Creating" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
