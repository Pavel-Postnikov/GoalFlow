import { useUIStore } from '@/store/ui'
import type { Task } from '@/types'
import { TaskItem } from './TaskItem'
import { QuickAddTask } from './QuickAddTask'
import { FilterBar } from './FilterBar'
import { KanbanBoard } from './KanbanBoard'

interface Props {
  tasks: Task[]
  projectId?: string
}

export function TaskList({ tasks, projectId }: Props) {
  const { viewMode, filters } = useUIStore()

  let filtered = tasks
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q))
  }
  if (filters.priority) {
    filtered = filtered.filter((t) => t.priority === filters.priority)
  }

  if (viewMode === 'kanban') {
    return (
      <div className="h-full flex flex-col">
        <FilterBar />
        <KanbanBoard tasks={filtered} projectId={projectId} />
      </div>
    )
  }

  const todo = filtered.filter((t) => t.status !== 'done')
  const done = filtered.filter((t) => t.status === 'done')

  return (
    <div className="max-w-2xl">
      <FilterBar />

      <div className="space-y-px">
        {todo.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          {todo.length > 0 && <div className="my-3 border-t border-zinc-100" />}
          <div className="space-y-px">
            {done.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </>
      )}

      <QuickAddTask projectId={projectId} />
    </div>
  )
}
