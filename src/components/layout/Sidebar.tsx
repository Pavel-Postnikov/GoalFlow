import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Inbox, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cn } from '@/lib/utils'
import { db } from '@/db'
import { goals as goalsQuery } from '@/db/queries'
import { GoalItem } from './GoalItem'
import { InlineCreate } from './InlineCreate'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
    isActive
      ? 'bg-indigo-50 text-indigo-700 font-medium'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  )
}

export function Sidebar() {
  const navigate = useNavigate()
  const [addingGoal, setAddingGoal] = useState(false)

  const allGoals = useLiveQuery(() => db.goals.orderBy('createdAt').toArray(), [])
  const allProjects = useLiveQuery(() => db.projects.orderBy('createdAt').toArray(), [])

  async function handleAddGoal(title: string) {
    const id = await goalsQuery.create({ title })
    setAddingGoal(false)
    navigate(`/goals/${id}`)
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-zinc-50 border-r border-zinc-200 shrink-0">
      <div className="px-4 h-14 flex items-center border-b border-zinc-200">
        <span className="text-base font-semibold text-zinc-900 tracking-tight">GoalFlow</span>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <NavLink to="/" end className={navLinkClass}>
          <Inbox size={15} />
          Inbox
        </NavLink>

        <div className="mt-4">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Цели</p>
            <button
              onClick={() => setAddingGoal(true)}
              className="p-0.5 text-zinc-400 hover:text-zinc-700 transition-colors"
              title="Добавить цель"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="space-y-0.5">
            {addingGoal && (
              <InlineCreate
                placeholder="Название цели..."
                onSubmit={handleAddGoal}
                onCancel={() => setAddingGoal(false)}
              />
            )}

            {allGoals?.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                goalProjects={(allProjects ?? []).filter((p) => p.goalId === goal.id)}
              />
            ))}

            {!addingGoal && (allGoals?.length ?? 0) === 0 && (
              <p className="px-3 py-1 text-xs text-zinc-400">Нет целей</p>
            )}
          </div>
        </div>
      </nav>
    </aside>
  )
}
