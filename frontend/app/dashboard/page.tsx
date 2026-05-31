"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { NewTaskModal } from "@/components/NewTaskModal";
import { TaskCard } from "@/components/TaskCard";
import {
  createTask,
  fetchTasks,
  fetchUsers,
  updateTaskStatus,
} from "@/lib/api";
import { getSessionUser, logout } from "@/lib/auth";
import type { SessionUser, Task, TaskStatus, User } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError("");
    const [loadedUsers, loadedTasks] = await Promise.all([fetchUsers(), fetchTasks()]);
    setUsers(loadedUsers);
    setTasks(loadedTasks);
  }, []);

  useEffect(() => {
    const session = getSessionUser();
    if (!session) {
      router.replace("/");
      return;
    }

    setCurrentUser(session);
    loadDashboard()
      .catch(() => setError("Dashboard could not be loaded."))
      .finally(() => setLoading(false));
  }, [loadDashboard, router]);

  const profile = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    return users.find((user) => user.id === currentUser.id) || currentUser;
  }, [currentUser, users]);

  const assignedTasks = useMemo(
    () => tasks.filter((task) => task.assigned_to === currentUser?.id),
    [tasks, currentUser?.id]
  );

  const createdTasks = useMemo(
    () => tasks.filter((task) => task.created_by === currentUser?.id),
    [tasks, currentUser?.id]
  );

  async function handleCreateTask(input: {
    title: string;
    description: string;
    assigned_to: string;
  }) {
    await createTask(input);
    await loadDashboard();
    setShowModal(false);
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    setBusyTaskId(taskId);
    setError("");

    try {
      await updateTaskStatus(taskId, status);
      await loadDashboard();
    } catch {
      setError("Task status could not be updated.");
    } finally {
      setBusyTaskId(null);
    }
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg text-sm text-app-secondary">
        Redirecting...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg text-app-primary">
      <header className="border-b border-app-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="font-mono text-xl font-bold">task-manager</div>

          <div className="flex items-center gap-3">
            {isUser(profile) && profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full border border-app-border object-cover"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full border border-app-border text-sm text-app-secondary">
                {(profile?.name || profile?.email || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="hidden min-w-0 text-right text-sm sm:block">
              <div className="truncate text-app-primary">{profile?.name || "User"}</div>
              <div className="truncate text-app-secondary">{profile?.email}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="h-9 rounded-md border border-app-border px-3 text-sm text-app-secondary transition hover:border-app-primary hover:text-app-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-app-primary">Dashboard</h1>
            {error ? <p className="mt-1 text-sm text-app-secondary">{error}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-10 rounded-md bg-app-primary px-4 text-sm font-semibold text-app-bg"
          >
            + New Task
          </button>
        </div>

        {loading ? (
          <div className="rounded-md border border-app-border bg-app-surface p-5 text-sm text-app-secondary">
            Loading...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <TaskSection
              title="Assigned to Me"
              tasks={assignedTasks}
              currentUser={currentUser}
              mode="assigned"
              busyTaskId={busyTaskId}
              onStatusChange={handleStatusChange}
            />
            <TaskSection
              title="Created by Me"
              tasks={createdTasks}
              currentUser={currentUser}
              mode="created"
              busyTaskId={busyTaskId}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </section>

      {showModal ? (
        <NewTaskModal
          users={users}
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTask}
        />
      ) : null}
    </main>
  );
}

function TaskSection({
  title,
  tasks,
  currentUser,
  mode,
  busyTaskId,
  onStatusChange,
}: {
  title: string;
  tasks: Task[];
  currentUser: SessionUser;
  mode: "assigned" | "created";
  busyTaskId: string | null;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <section className="min-h-80">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-app-secondary">{title}</h2>
        <span className="text-sm text-app-secondary">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              mode={mode}
              busy={busyTaskId === task.id}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="rounded-md border border-app-border bg-app-surface p-5 text-sm text-app-secondary">
            No tasks.
          </div>
        )}
      </div>
    </section>
  );
}

function isUser(profile: SessionUser | User | null): profile is User {
  return Boolean(profile && "avatar_url" in profile);
}
