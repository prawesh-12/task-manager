export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
};

export type TaskStatus = "pending" | "in_progress" | "completed";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  created_by: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  creator?: User | null;
  assignee?: User | null;
};

export type SessionUser = {
  id: string;
  email?: string;
  name?: string;
};
