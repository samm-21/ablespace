export interface User {
  _id: string;
  email: string;
  fullName: string;
  username: string;
  title: string;
  avatar: string | null;
  isGuest: boolean;
  googleId?: string;
  preferences: {
    theme: 'light' | 'dark';
    colorMode: 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';
  };
  createdAt: string;
}

export interface Subtask {
  _id: string;
  title: string;
  priority: Priority;
  members: User[];
  dueDate: string | null;
  completed: boolean;
}

export interface Resource {
  name: string;
  url: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  members: User[];
  dueDate: string | null;
  labels: string[];
  reporter: User | null;
  team: string;
  project: { _id: string; name: string } | null;
  resources: Resource[];
  subtasks: Subtask[];
  order: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  updates?: { message: string; time: string | Date }[];
}

export interface Project {
  _id: string;
  name: string;
  priority: Priority;
  lead: User | null;
  dueDate: string | null;
  createdBy: User;
  createdAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  author: User;
  content: string;
  parentComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Status = 'todo' | 'doing' | 'completed' | 'on-hold' | 'backlog';
export type Priority = 'no-priority' | 'urgent' | 'high' | 'medium' | 'low';
export type ColorMode = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';
export type Theme = 'light' | 'dark';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
