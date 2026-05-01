import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { tasks as taskQueries } from '@/db/queries'
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

// Переиспользуемое содержимое карточки (для DraggableCard и DragOverlay)
function CardContent({ task }: { task: Task }) {
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
    <>
      <p className="text-sm text-zinc-900 leading-snug">{task.title}</p>
      {(task.priority || dueLabel) && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {task.priority && (
            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', PRIORITY_CLASS[task.priority])}>
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
    </>
  )
}

function DraggableCard({ task }: { task: Task }) {
  const [, setSearchParams] = useSearchParams()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  function openDetail() {
    setSearchParams((prev) => {
      prev.set('task', task.id)
      return prev
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={openDetail}
      className={cn(
        'bg-white border border-zinc-200 rounded-lg p-3 cursor-grab active:cursor-grabbing',
        'hover:border-indigo-300 hover:shadow-sm transition-all select-none touch-none',
        isDragging && 'opacity-40',
      )}
    >
      <CardContent task={task} />
    </div>
  )
}

function DroppableColumn({
  col,
  colTasks,
  isOver,
  projectId,
}: {
  col: (typeof COLUMNS)[number]
  colTasks: Task[]
  isOver: boolean
  projectId?: string
}) {
  const { setNodeRef } = useDroppable({ id: col.status })

  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', col.headerClass)}>
          {col.label}
        </span>
        <span className="text-xs text-zinc-400">{colTasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 overflow-y-auto rounded-lg p-1 min-h-16 transition-colors',
          isOver && 'bg-indigo-50/60 ring-1 ring-indigo-200',
        )}
      >
        {colTasks.map((task) => (
          <DraggableCard key={task.id} task={task} />
        ))}
      </div>

      {col.status === 'todo' && (
        <div className="mt-2">
          <QuickAddTask projectId={projectId} />
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // distance: 5 — нужно сдвинуть на 5px чтобы начать drag, обычный клик не перехватывается
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) ?? null : null

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)
    if (!over) return

    const newStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.id === active.id)
    if (!task || task.status === newStatus) return

    await taskQueries.update(task.id, { status: newStatus })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveId(active.id as string)}
      onDragOver={({ over }) => setOverId((over?.id as string) ?? null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4 min-h-0">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            col={col}
            colTasks={tasks.filter((t) => t.status === col.status)}
            isOver={overId === col.status}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className="bg-white border border-indigo-300 shadow-xl rounded-lg p-3 w-64 cursor-grabbing rotate-1">
            <CardContent task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
