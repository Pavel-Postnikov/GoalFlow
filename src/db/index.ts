import Dexie, { type EntityTable } from 'dexie'
import type { Goal, Project, Task, TimeEntry, Tag, TaskTag } from '@/types'

class GoalFlowDB extends Dexie {
  goals!: EntityTable<Goal, 'id'>
  projects!: EntityTable<Project, 'id'>
  tasks!: EntityTable<Task, 'id'>
  timeEntries!: EntityTable<TimeEntry, 'id'>
  tags!: EntityTable<Tag, 'id'>
  taskTags!: EntityTable<TaskTag, 'taskId'>

  constructor() {
    super('GoalFlowDB')

    this.version(1).stores({
      goals: 'id, status, createdAt',
      projects: 'id, goalId, status, createdAt',
      tasks: 'id, projectId, parentId, status, priority, dueDate, createdAt',
      timeEntries: 'id, taskId, startedAt, stoppedAt',
      tags: 'id, name, createdAt',
      taskTags: '[taskId+tagId], taskId, tagId',
    })
  }
}

export const db = new GoalFlowDB()
