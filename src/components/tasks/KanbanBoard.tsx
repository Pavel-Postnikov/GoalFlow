import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { QuickAddTask } from './QuickAddTask'
import type { Task, TaskStatus } from '@/types'

const COLUMNS: { status: TaskStatus; label: string; headerClass: string }[] = [
  { status: 'todo', label: 'К выполнению', headerClass: 'text-zinc-600 bg-zinc-100' },
  { status: 'in_progress', label: 'В работе', headerClass: 'text-blue-700 bg-blue-100' },
  { status: 'done', label: 'Готово', headerClass: 'text-green-700 bg-green-100' },
]

const PRIORITY_CLASS = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-zinc-500 bg-zinc-100',
} as const

const PRIORITY_LABEL = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
} as const

function KanbanCard({ task }: { task: Task }) {
  const [, setSearchParams] = useSearchParams()

  function openDetail() {
    setSearchParams((prev) => {
      prev.set('task', task.id)
      return prev
    })
  }

  let dueLabel = ''
  let isOverdue = false
  if (task.dueDate) {
    const d = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    isOverdue = d < today && task.status !== 'done'
    dueLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  return (
    <div
      onClick={openDetail}
      className="bg-white border border-zinc-200 rounded-lg p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all select-none"
    >
      <p className="text-sm text-zinc-900 leading-snug">{task.title}</p>

      {(task.priority || dueLabel) && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {task.priority && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded font-medium',
                PRIORITY_CLASS[task.priority],
              )}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
          {dueLabel && (
            <span className={cn('text-xs', isOverdue ? 'text-red-500' : 'text-zinc-400')}>
              {dueLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  tasks: Task[]
  projectId?: string
}

export function KanbanBoard({ tasks, projectId }: Props) {
  return (
    <div className="flex gap-4 flex-1 overflow-x-auto pb-4 min-h-0">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status)

        return (
          <div key={col.status} className="flex flex-col w-64 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', col.headerClass)}>
                {col.label}
              </span>
              <span className="text-xs text-zinc-400">{colTasks.length}</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {colTasks.map((task) => (
                <KanbanCard key={task.id} task={task} />
              ))}
            </div>

            {col.status === 'todo' && (
              <div className="mt-2">
                <QuickAddTask projectId={projectId} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
