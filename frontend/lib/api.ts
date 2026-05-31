import axios from "axios";
import { clearToken, getToken } from "./auth";
import type { Task, TaskStatus, User } from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export async function fetchUsers() {
  const response = await api.get<{ users: User[] }>("/users");
  return response.data.users;
}

export async function fetchTasks() {
  const response = await api.get<{ tasks: Task[] }>("/tasks");
  return response.data.tasks;
}

export async function createTask(input: {
  title: string;
  description: string;
  assigned_to: string;
}) {
  const response = await api.post<{ task: Task; email_warning?: string }>("/tasks", input);
  return response.data;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const response = await api.patch<{ task: Task; email_warning?: string }>(`/tasks/${taskId}`, {
    status,
  });
  return response.data;
}
