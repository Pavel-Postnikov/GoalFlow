import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { X, Circle, CheckCircle2, Plus, Wand2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTaskDescription } from '@/lib/ai'
import { db } from '@/db'
import { tasks } from '@/db/queries'
import { InlineCreate } from '@/components/layout/InlineCreate'
import type { Priority, Task, TaskStatus } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TaskStatus; label: string; activeClass: string }[] = [
  { value: 'todo', label: 'К выполнению', activeClass: 'text-zinc-700 bg-zinc-200' },
  { value: 'in_progress', label: 'В работе', activeClass: 'text-blue-700 bg-blue-100' },
  { value: 'done', label: 'Готово', activeClass: 'text-green-700 bg-green-100' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string; activeClass: string }[] = [
  { value: 'low', label: 'Низкий', activeClass: 'text-zinc-700 bg-zinc-200' },
  { value: 'medium', label: 'Средний', activeClass: 'text-amber-700 bg-amber-100' },
  { value: 'high', label: 'Высокий', activeClass: 'text-red-700 bg-red-100' },
]

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}ч ${m}мин`
  if (h > 0) return `${h}ч`
  if (m > 0) return `${m}мин`
  return `${seconds}с`
}

function dateToInput(date?: Date): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

// ─── Subtask row ──────────────────────────────────────────────────────────────

function SubtaskItem({ task: sub }: { task: Task }) {
  const isDone = sub.status === 'done'
  return (
    <div className="flex items-center gap-2 px-1 py-1 rounded hover:bg-zinc-50">
      <button
        onClick={() => tasks.update(sub.id, { status: isDone ? 'todo' : 'done' })}
        className={cn(
          'shrink-0 transition-colors',
          isDone ? 'text-indigo-500' : 'text-zinc-300 hover:text-indigo-400',
        )}
      >
        {isDone ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>
      <span className={cn('text-sm', isDone && 'line-through text-zinc-400')}>{sub.title}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TaskDetailPanel() {
  const [searchParams, setSearchParams] = useSearchParams()
  const taskId = searchParams.get('task')

  const task = useLiveQuery(() => (taskId ? db.tasks.get(taskId) : undefined), [taskId])
  const subtasks = useLiveQuery(
    () => (taskId ? db.tasks.where('parentId').equals(taskId).toArray() : []),
    [taskId],
  )
  const entries = useLiveQuery(
    () => (taskId ? db.timeEntries.where('taskId').equals(taskId).toArray() : []),
    [taskId],
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
    }
  }, [task?.id])

  function close() {
    setSearchParams((prev) => {
      prev.delete('task')
      return prev
    })
  }

  async function handleFormat() {
    if (!task || !description.trim()) return
    setIsFormatting(true)
    try {
      const formatted = await formatTaskDescription(description)
      setDescription(formatted)
      await tasks.update(task.id, { description: formatted })
    } catch {
      // silent — пользователь видит что кнопка не сработала
    } finally {
      setIsFormatting(false)
    }
  }

  async function handleAddSubtask(subTitle: string) {
    if (!task) return
    await tasks.create({ title: subTitle, parentId: task.id, projectId: task.projectId })
    setAddingSubtask(false)
  }

  if (!taskId || !task) return null

  const completedEntries = (entries ?? []).filter((e) => e.duration != null)

  return (
    <aside className="w-[400px] border-l border-zinc-200 bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-100 shrink-0">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Детали</span>
        <button onClick={close} className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-5 pt-5 pb-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && tasks.update(task.id, { title: title.trim() })}
            className="w-full text-base font-semibold text-zinc-900 bg-transparent outline-none placeholder:text-zinc-300"
            placeholder="Название задачи"
          />
        </div>

        {/* Description */}
        <div className="px-5 pb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => tasks.update(task.id, { description: description || undefined })}
            rows={3}
            placeholder="Описание..."
            disabled={isFormatting}
            className="w-full text-sm text-zinc-600 bg-transparent outline-none resize-none placeholder:text-zinc-300 transition-opacity disabled:opacity-40"
          />
          {description.trim() && (
            <div className="flex justify-end mt-1">
              <button
                onClick={handleFormat}
                disabled={isFormatting}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-500 transition-colors disabled:opacity-40"
              >
                {isFormatting
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Wand2 size={11} />}
                {isFormatting ? 'Форматирую...' : 'Отформатировать'}
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-100" />

        {/* Status, Priority & Due date */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400 w-20 shrink-0">Статус</span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => tasks.update(task.id, { status: opt.value })}
                  className={cn(
                    'px-2 py-0.5 text-xs rounded font-medium transition-colors',
                    task.status === opt.value
                      ? opt.activeClass
                      : 'text-zinc-400 hover:bg-zinc-100',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400 w-20 shrink-0">Приоритет</span>
            <div className="flex gap-1">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    tasks.update(task.id, {
                      priority: task.priority === opt.value ? undefined : opt.value,
                    })
                  }
                  className={cn(
                    'px-2 py-0.5 text-xs rounded font-medium transition-colors',
                    task.priority === opt.value
                      ? opt.activeClass
                      : 'text-zinc-400 hover:bg-zinc-100',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400 w-20 shrink-0">Срок</span>
            <input
              type="date"
              value={dateToInput(task.dueDate)}
              onChange={(e) =>
                tasks.update(task.id, {
                  dueDate: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="text-sm text-zinc-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="border-t border-zinc-100" />

        {/* Subtasks */}
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Подзадачи
          </p>
          <div className="space-y-0.5">
            {subtasks?.map((sub) => <SubtaskItem key={sub.id} task={sub} />)}
          </div>
          {addingSubtask ? (
            <div className="mt-1">
              <InlineCreate
                placeholder="Название подзадачи..."
                onSubmit={handleAddSubtask}
                onCancel={() => setAddingSubtask(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingSubtask(true)}
              className="flex items-center gap-1.5 mt-1 px-1 py-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <Plus size={12} />
              Добавить подзадачу
            </button>
          )}
        </div>

        {/* Time log */}
        {completedEntries.length > 0 && (
          <>
            <div className="border-t border-zinc-100" />
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                Время
              </p>
              <div className="space-y-1.5">
                {completedEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between text-xs text-zinc-500">
                    <span>
                      {new Date(entry.startedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span>{formatDuration(entry.duration!)}</span>
                  </div>
                ))}
              </div>
              {task.totalTime > 0 && (
                <div className="flex justify-between text-xs font-semibold text-zinc-700 mt-2 pt-2 border-t border-zinc-100">
                  <span>Итого</span>
                  <span>{formatDuration(task.totalTime)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
