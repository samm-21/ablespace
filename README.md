# Pyramid — Task Management System

A full-stack task management application built with **Next.js**, **NestJS**, **MongoDB**, and **Socket.IO**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, TypeScript |
| Backend | NestJS, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT + Google OAuth 2.0 |
| Real-time | Socket.IO |
| Drag & Drop | @dnd-kit |

---

## Features

- **Login** — Continue as Guest (instant, no signup) or Login with Google
- **Kanban Board** — Drag-and-drop tasks between columns (To Do, Doing, Completed, On Hold)
- **List View** — Collapsible status groups, sortable table view
- **Task Detail** — Edit title/desc inline, manage priority, members, labels, resources, subtasks, comments
- **Real-time** — All task changes are broadcast live via WebSockets
- **Projects** — Create projects and scope tasks per project
- **Settings** — Profile, Theme (Light/Dark), Color Mode (6 accent colors)
- **Theming** — Dark/Light mode + 6 accent colors (Amber, Blue, Pink, Rose, Emerald, Black)

---

## Project Structure

```
ablespace/
├── backend/          # NestJS API (port 3001)
│   └── src/
│       ├── auth/     # JWT + Google OAuth
│       ├── users/    # User profile & preferences
│       ├── tasks/    # Tasks CRUD + WebSocket gateway
│       ├── projects/ # Projects CRUD
│       ├── comments/ # Comments + replies
│       └── common/   # Exception filter
└── frontend/         # Next.js app (port 3000)
    └── src/
        ├── app/
        │   ├── login/           # Login page
        │   ├── auth/callback/   # OAuth callback
        │   ├── (dashboard)/
        │   │   ├── tasks/       # Kanban/List + [taskId] detail
        │   │   └── projects/    # Projects list + [projectId]
        │   └── settings/        # Profile, Theme, Color settings
        ├── components/          # Shared UI components
        ├── hooks/               # useAuth, useSocket
        ├── lib/                 # api.ts, socket.ts, constants.ts
        └── types/               # TypeScript interfaces
```

---

## Getting Started

### Backend

```bash
cd backend
npm run start:dev      # runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm run dev            # runs on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/pyramid
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable "Google OAuth 2.0" API
3. Create OAuth credentials → Set callback URL to `http://localhost:3001/api/auth/google/callback`
4. Copy `Client ID` and `Client Secret` into `backend/.env`

> **Without Google OAuth configured, Guest login works perfectly fine.**

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/guest` | Create guest session |
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/tasks` | List tasks (filterable) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task detail |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/reorder` | Drag-drop reorder |
| POST | `/api/tasks/:id/subtasks` | Add subtask |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id/tasks` | Tasks in project |
| GET | `/api/tasks/:id/comments` | Task comments |
| POST | `/api/tasks/:id/comments` | Add comment/reply |
| PATCH | `/api/users/me` | Update profile |
| PATCH | `/api/users/me/preferences` | Save theme/color |

---

## WebSocket Events (Socket.IO)

| Event | Direction | Payload |
|---|---|---|
| `task:created` | Server → Client | Full task object |
| `task:updated` | Server → Client | Full task object |
| `task:deleted` | Server → Client | `{ id: string }` |
| `comment:created` | Server → Client | `{ taskId, comment }` |

---

### Part 2 - [Understanding workflow](https://docs.google.com/document/d/1islwfoAZLWtsKxrgcO2gJQZ--Osw2OJayO66_R7FaTo/edit?usp=sharing)
