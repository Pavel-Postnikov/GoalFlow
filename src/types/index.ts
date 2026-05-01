// ─── Enums ────────────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'archived'

export type ProjectStatus = 'active' | 'completed' | 'archived'

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

export type Priority = 'low' | 'medium' | 'high'

// ─── Core entities ────────────────────────────────────────────────────────────

export interface Goal {
  id: string
  title: string
  description?: string
  status: GoalStatus
  color?: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  goalId?: string        // null → проект без цели
  title: string
  description?: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  projectId?: string     // null → Inbox
  parentId?: string      // null → обычная задача; string → подзадача (глубина = 1)
  title: string
  description?: string
  status: TaskStatus
  priority?: Priority
  dueDate?: Date
  totalTime: number      // секунды, пересчитывается из TimeEntry
  createdAt: Date
  updatedAt: Date
}

export interface TimeEntry {
  id: string
  taskId: string
  startedAt: Date
  stoppedAt?: Date       // null → таймер сейчас активен
  duration?: number      // секунды, заполняется при ручном вводе
  note?: string
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface TaskTag {
  taskId: string
  tagId: string
}

// ─── Derived / view types ─────────────────────────────────────────────────────

/** Task с подтянутыми тегами — используется в UI */
export interface TaskWithTags extends Task {
  tags: Tag[]
}

/** Task с подзадачами — используется в детальном виде */
export interface TaskWithSubtasks extends TaskWithTags {
  subtasks: TaskWithTags[]
}

/** Активная запись времени (таймер запущен) */
export interface ActiveTimer {
  taskId: string
  taskTitle: string
  startedAt: Date
  timeEntryId: string
}

// ─── UI state types ───────────────────────────────────────────────────────────

export type ViewMode = 'list' | 'kanban'

export interface TaskFilters {
  projectId?: string
  goalId?: string
  status?: TaskStatus
  priority?: Priority
  tagId?: string
  search?: string
}
