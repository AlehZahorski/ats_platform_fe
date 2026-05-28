import apiClient from "./client";
import type { AvatarKey, UserRole } from "@/entities/user";

export type ScheduleStatus = "work" | "remote" | "vacation" | "sick" | "off";

export interface EmployeeSummary {
  id: string;
  email: string;
  role: UserRole;
  avatar_key: AvatarKey | null;
}

export interface DayAggregate {
  date: string;             // YYYY-MM-DD
  status: ScheduleStatus | null;
  start_time: string | null; // HH:MM:SS
  end_time: string | null;
  has_note: boolean;
  has_manager_note: boolean;
  tasks_total: number;
  tasks_done: number;
  tasks_overdue: number;
}

export interface EmployeeRow {
  user: EmployeeSummary;
  days: DayAggregate[];
}

export interface BoardResponse {
  week_start: string;
  week_end: string;
  scope: "self" | "team";
  employees: EmployeeRow[];
}

export interface ScheduleOut {
  status: ScheduleStatus;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  manager_note: string | null;
  updated_by: EmployeeSummary | null;
  updated_at: string | null;
}

export interface TaskAuthor {
  id: string;
  email: string;
  role: UserRole;
  avatar_key: AvatarKey | null;
}

export interface DayTask {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  completed: boolean;
  due_date: string | null;
  created_by: TaskAuthor | null;
}

export interface DayResponse {
  user: EmployeeSummary;
  date: string;
  schedule: ScheduleOut;
  tasks: DayTask[];
}

export interface ScheduleUpsertPayload {
  user_id: string;
  date: string;          // YYYY-MM-DD
  status: ScheduleStatus;
  start_time?: string | null;
  end_time?: string | null;
  note?: string | null;
  manager_note?: string | null;
}

export const organizerApi = {
  board: (params: { week_start: string; scope: "self" | "team" }) =>
    apiClient.get<BoardResponse>("/organizer/board", { params }),
  day: (params: { user_id: string; date: string }) =>
    apiClient.get<DayResponse>("/organizer/day", { params }),
  upsertSchedule: (data: ScheduleUpsertPayload) =>
    apiClient.put<ScheduleOut>("/organizer/schedule", data),
};

export const usersApi = {
  updateAvatar: (avatar_key: AvatarKey | null) =>
    apiClient.patch("/users/me/avatar", { avatar_key }),
};
