import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { List, LayoutDashboard, Timer, Download } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useUIStore } from '@/store/ui'
import { useTimerStore } from '@/store/timer'
import { db } from '@/db'
import { cn } from '@/lib/utils'

async function exportJSON() {
  const [allTasks, allProjects, allGoals] = await Promise.all([
    db.tasks.toArray(),
    db.projects.toArray(),
    db.goals.toArray(),
  ])
  const data = { goals: allGoals, projects: allProjects, tasks: allTasks, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `goalflow-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function Header() {
  const { pathname } = useLocation()
  const { goalId, projectId } = useParams()
  const { viewMode, setViewMode } = useUIStore()
  const active = useTimerStore((s) => s.active)
  const stop = useTimerStore((s) => s.stop)

  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) { setElapsed(0); return }
    const tick = () => setElapsed(Math.floor((Date.now() - active.startedAt.getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [active])

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
            <span className="text-orange-500 font-mono tabular-nums">{formatElapsed(elapsed)}</span>
            <span className="text-orange-400">· стоп</span>
          </button>
        )}

        <button
          onClick={exportJSON}
          title="Экспорт в JSON"
          className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <Download size={15} />
        </button>

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
