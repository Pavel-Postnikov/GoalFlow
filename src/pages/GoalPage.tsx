import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { FolderOpen } from 'lucide-react'
import { db } from '@/db'

export function GoalPage() {
  const { goalId } = useParams()

  const projects = useLiveQuery(
    () => (goalId ? db.projects.where('goalId').equals(goalId).toArray() : []),
    [goalId],
  )

  if (!projects) return null

  if (projects.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Нет проектов. Создайте первый в сайдбаре.</p>
    )
  }

  return (
    <div className="max-w-2xl grid gap-2">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={`/projects/${project.id}`}
          className="flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group"
        >
          <FolderOpen
            size={18}
            className="text-zinc-400 group-hover:text-indigo-500 shrink-0 transition-colors"
          />
          <span className="text-sm font-medium text-zinc-900">{project.title}</span>
        </Link>
      ))}
    </div>
  )
}
