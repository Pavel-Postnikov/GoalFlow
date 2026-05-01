import { db } from './index'
import type { Goal, Project, Task, Tag, TaskTag, TaskWithTags } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return new Date()
}

function uuid() {
  return crypto.randomUUID()
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export const goals = {
  getAll: () => db.goals.orderBy('createdAt').toArray(),

  getById: (id: string) => db.goals.get(id),

  create: (data: Pick<Goal, 'title' | 'description' | 'color'>) =>
    db.goals.add({
      id: uuid(),
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
      ...data,
    }),

  update: (id: string, data: Partial<Pick<Goal, 'title' | 'description' | 'color' | 'status'>>) =>
    db.goals.update(id, { ...data, updatedAt: now() }),

  delete: (id: string) => db.goals.delete(id),
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = {
  getAll: () => db.projects.orderBy('createdAt').toArray(),

  getByGoal: (goalId: string) => db.projects.where('goalId').equals(goalId).toArray(),

  getById: (id: string) => db.projects.get(id),

  create: (data: Pick<Project, 'title' | 'description' | 'goalId'>) =>
    db.projects.add({
      id: uuid(),
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
      ...data,
    }),

  update: (id: string, data: Partial<Pick<Project, 'title' | 'description' | 'goalId' | 'status'>>) =>
    db.projects.update(id, { ...data, updatedAt: now() }),

  delete: (id: string) => db.projects.delete(id),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks = {
  getAll: () => db.tasks.orderBy('createdAt').toArray(),

  getInbox: () => db.tasks.filter(t => !t.projectId && !t.parentId).toArray(),

  getByProject: (projectId: string) =>
    db.tasks.where('projectId').equals(projectId).filter(t => !t.parentId).toArray(),

  getSubtasks: (parentId: string) =>
    db.tasks.where('parentId').equals(parentId).toArray(),

  getById: (id: string) => db.tasks.get(id),

  create: (data: Pick<Task, 'title' | 'description' | 'projectId' | 'parentId' | 'priority' | 'dueDate'>) =>
    db.tasks.add({
      id: uuid(),
      status: 'todo',
      totalTime: 0,
      createdAt: now(),
      updatedAt: now(),
      ...data,
    }),

  update: (id: string, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'projectId' | 'totalTime'>>) =>
    db.tasks.update(id, { ...data, updatedAt: now() }),

  delete: async (id: string) => {
    await db.taskTags.where('taskId').equals(id).delete()
    await db.timeEntries.where('taskId').equals(id).delete()
    await db.tasks.where('parentId').equals(id).delete()
    await db.tasks.delete(id)
  },
}

// ─── Time entries ─────────────────────────────────────────────────────────────

export const timeEntries = {
  getByTask: (taskId: string) => db.timeEntries.where('taskId').equals(taskId).toArray(),

  getActive: () => db.timeEntries.filter(e => !e.stoppedAt).first(),

  start: async (taskId: string): Promise<string> => {
    const id = uuid()
    await db.timeEntries.add({ id, taskId, startedAt: now() })
    await db.tasks.update(taskId, { status: 'in_progress', updatedAt: now() })
    return id
  },

  stop: async (entryId: string) => {
    const entry = await db.timeEntries.get(entryId)
    if (!entry) return

    const stoppedAt = now()
    const duration = Math.floor((stoppedAt.getTime() - entry.startedAt.getTime()) / 1000)

    await db.timeEntries.update(entryId, { stoppedAt, duration })

    // пересчитываем totalTime задачи
    const allEntries = await db.timeEntries.where('taskId').equals(entry.taskId).toArray()
    const totalTime = allEntries.reduce((sum, e) => sum + (e.duration ?? 0), 0)
    await db.tasks.update(entry.taskId, { totalTime, updatedAt: now() })
  },

  addManual: async (taskId: string, duration: number, note?: string) => {
    const startedAt = now()
    await db.timeEntries.add({ id: uuid(), taskId, startedAt, stoppedAt: startedAt, duration, note })

    const allEntries = await db.timeEntries.where('taskId').equals(taskId).toArray()
    const totalTime = allEntries.reduce((sum, e) => sum + (e.duration ?? 0), 0)
    await db.tasks.update(taskId, { totalTime, updatedAt: now() })
  },
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const tags = {
  getAll: () => db.tags.orderBy('name').toArray(),

  getById: (id: string) => db.tags.get(id),

  create: (data: Pick<Tag, 'name' | 'color'>) =>
    db.tags.add({ id: uuid(), createdAt: now(), ...data }),

  update: (id: string, data: Partial<Pick<Tag, 'name' | 'color'>>) =>
    db.tags.update(id, data),

  delete: async (id: string) => {
    await db.taskTags.where('tagId').equals(id).delete()
    await db.tags.delete(id)
  },
}

// ─── TaskTags ─────────────────────────────────────────────────────────────────

export const taskTags = {
  getTagsForTask: async (taskId: string): Promise<Tag[]> => {
    const links = await db.taskTags.where('taskId').equals(taskId).toArray()
    return Promise.all(links.map(l => db.tags.get(l.tagId) as Promise<Tag>))
  },

  addTag: (taskId: string, tagId: string) =>
    db.taskTags.put({ taskId, tagId } satisfies TaskTag),

  removeTag: (taskId: string, tagId: string) =>
    db.taskTags.where('[taskId+tagId]').equals([taskId, tagId]).delete(),
}

// ─── Compound helpers ─────────────────────────────────────────────────────────

export async function getTaskWithTags(taskId: string): Promise<TaskWithTags | undefined> {
  const task = await db.tasks.get(taskId)
  if (!task) return undefined
  const tagList = await taskTags.getTagsForTask(taskId)
  return { ...task, tags: tagList }
}
