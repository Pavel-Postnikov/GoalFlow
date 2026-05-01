import { Search, X } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
]

export function FilterBar() {
  const { filters, setFilters, resetFilters } = useUIStore()
  const hasFilters = filters.search || filters.priority

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          placeholder="Поиск..."
          className="pl-7 pr-3 py-1.5 text-sm border border-zinc-200 rounded-md outline-none focus:border-indigo-300 w-44 transition-colors"
        />
      </div>

      <div className="flex gap-1">
        {PRIORITIES.map((p) => (
          <button
            key={p.value}
            onClick={() =>
              setFilters({ priority: filters.priority === p.value ? undefined : p.value })
            }
            className={cn(
              'px-2.5 py-1.5 text-xs rounded-md border transition-colors',
              filters.priority === p.value
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={resetFilters}
          title="Сбросить фильтры"
          className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
