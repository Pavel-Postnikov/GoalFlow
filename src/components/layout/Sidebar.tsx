import { NavLink } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
    isActive
      ? 'bg-indigo-50 text-indigo-700 font-medium'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  )
}

export function Sidebar() {
  return (
    <aside className="w-64 h-full flex flex-col bg-zinc-50 border-r border-zinc-200 shrink-0">
      <div className="px-4 h-14 flex items-center border-b border-zinc-200">
        <span className="text-base font-semibold text-zinc-900 tracking-tight">GoalFlow</span>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
        <NavLink to="/" end className={navLinkClass}>
          <Inbox size={15} />
          Inbox
        </NavLink>

        <div className="pt-4">
          <p className="px-3 mb-1.5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Цели
          </p>
          {/* Phase 2: GoalsList будет здесь */}
          <p className="px-3 py-1 text-xs text-zinc-400">Нет целей</p>
        </div>
      </nav>
    </aside>
  )
}
