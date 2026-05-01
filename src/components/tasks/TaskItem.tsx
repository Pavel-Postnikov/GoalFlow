import { Circle, CheckCircle2, Play, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tasks } from '@/db/queries'
import { useTimerStore } from '@/store/timer'
import type { Task } from '@/types'

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

interface Props {
  task: Task
}

export function TaskItem({ task }: Props) {
  const active = useTimerStore((s) => s.active)
  const start = useTimerStore((s) => s.start)
  const stop = useTimerStore((s) => s.stop)

  const isTimerActive = active?.taskId === task.id
  const isDone = task.status === 'done'

  function toggleStatus() {
    tasks.update(task.id, { status: isDone ? 'todo' : 'done' })
  }

  function toggleTimer() {
    if (isTimerActive) stop()
    else start(task.id, task.title)
  }

  let dueLabel = ''
  let isOverdue = false
  if (task.dueDate) {
    const d = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    isOverdue = d < today && !isDone
    dueLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors">
      <button
        onClick={toggleStatus}
        className={cn(
          'shrink-0 transition-colors',
          isDone ? 'text-indigo-500' : 'text-zinc-300 hover:text-indigo-400',
        )}
      >
        {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      <span
        className={cn(
          'flex-1 text-sm min-w-0 truncate',
          isDone ? 'line-through text-zinc-400' : 'text-zinc-900',
        )}
      >
        {task.title}
      </span>

      {task.priority && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded font-medium shrink-0',
            PRIORITY_CLASS[task.priority],
          )}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
      )}

      {dueLabel && (
        <span className={cn('text-xs shrink-0', isOverdue ? 'text-red-500' : 'text-zinc-400')}>
          {dueLabel}
        </span>
      )}

      <button
        onClick={toggleTimer}
        title={isTimerActive ? 'Остановить' : 'Запустить таймер'}
        className={cn(
          'shrink-0 p-1 rounded transition-colors',
          isTimerActive
            ? 'text-orange-500 hover:text-orange-600'
            : 'text-zinc-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100',
        )}
      >
        {isTimerActive ? <Square size={13} fill="currentColor" /> : <Play size={13} />}
      </button>
    </div>
  )
}
