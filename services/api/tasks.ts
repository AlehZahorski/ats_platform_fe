import apiClient from "./client";

export interface TaskAssignee {
  id: string;
  email: string;
}

export interface Task {
  id: string;
  company_id: string;
  application_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  type: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  assignee: TaskAssignee | null;
  creator: TaskAssignee | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  type?: string;
  application_id?: string;
  assigned_to?: string;
  due_date?: string;
}

export const tasksApi = {
  list: (params?: { assigned_to_me?: boolean; completed?: boolean; application_id?: string }) =>
    apiClient.get<Task[]>("/tasks", { params }),
  create: (data: TaskCreate) => apiClient.post<Task>("/tasks", data),
  update: (id: string, data: Partial<TaskCreate> & { completed?: boolean }) =>
    apiClient.patch<Task>(`/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};