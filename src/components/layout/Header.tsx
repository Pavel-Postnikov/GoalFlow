import { useLocation, useParams } from 'react-router-dom'
import { List, LayoutDashboard, Timer } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useUIStore } from '@/store/ui'
import { useTimerStore } from '@/store/timer'
import { db } from '@/db'
import { cn } from '@/lib/utils'

export function Header() {
  const { pathname } = useLocation()
  const { goalId, projectId } = useParams()
  const { viewMode, setViewMode } = useUIStore()
  const active = useTimerStore((s) => s.active)
  const stop = useTimerStore((s) => s.stop)

  const goal = useLiveQuery(() => (goalId ? db.goals.get(goalId) : undefined), [goalId])
  const project = useLiveQuery(
    () => (projectId ? db.projects.get(projectId) : undefined),
    [projectId],
  )

  let title = 'GoalFlow'
  if (pathname === '/') title = 'Inbox'
  else if (goal) title = goal.title
  else if (project) title = project.title

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 bg-white">
      <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>

      <div className="flex items-center gap-3">
        {active && (
          <button
            onClick={stop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
          >
            <Timer size={13} />
            <span className="max-w-32 truncate">{active.taskTitle}</span>
            <span className="text-orange-400">· стоп</span>
          </button>
        )}

        <div className="flex items-center bg-zinc-100 rounded-md p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600',
            )}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'kanban'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600',
            )}
          >
            <LayoutDashboard size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
