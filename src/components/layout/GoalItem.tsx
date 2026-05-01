import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, FolderOpen, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { goals, projects } from '@/db/queries'
import { InlineCreate } from './InlineCreate'
import type { Goal, Project } from '@/types'

interface Props {
  goal: Goal
  goalProjects: Project[]
}

export function GoalItem({ goal, goalProjects }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState(false)
  const [addingProject, setAddingProject] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const matches =
      pathname === `/goals/${goal.id}` ||
      goalProjects.some((p) => pathname === `/projects/${p.id}`)
    if (matches) setExpanded(true)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showMenu) return
    const close = () => setShowMenu(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showMenu])

  async function handleAddProject(title: string) {
    const id = await projects.create({ title, goalId: goal.id })
    setAddingProject(false)
    navigate(`/projects/${id}`)
  }

  async function handleDeleteGoal() {
    await goals.delete(goal.id)
    navigate('/')
  }

  const projectNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-1.5 flex-1 px-2 py-1 text-xs rounded transition-colors min-w-0',
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-medium'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
    )

  return (
    <div>
      <div className="group flex items-center gap-0.5 px-1 rounded-lg hover:bg-zinc-100">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-1 text-zinc-400 hover:text-zinc-600 shrink-0"
        >
          <ChevronRight
            size={13}
            className={cn('transition-transform duration-150', expanded && 'rotate-90')}
          />
        </button>

        <NavLink
          to={`/goals/${goal.id}`}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 flex-1 py-1.5 text-sm font-medium min-w-0',
              isActive ? 'text-indigo-700' : 'text-zinc-700 hover:text-zinc-900',
            )
          }
        >
          {goal.color && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: goal.color }}
            />
          )}
          <span className="truncate">{goal.title}</span>
        </NavLink>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => { setExpanded(true); setAddingProject(true) }}
            className="p-1 text-zinc-400 hover:text-zinc-700"
            title="Добавить проект"
          >
            <Plus size={12} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v) }}
              className="p-1 text-zinc-400 hover:text-zinc-700"
            >
              <MoreHorizontal size={12} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-zinc-200 rounded-lg shadow-md z-20 py-1">
                <button
                  onClick={handleDeleteGoal}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={12} />
                  Удалить цель
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="ml-5 mt-0.5 space-y-0.5">
          {goalProjects.map((project) => (
            <div key={project.id} className="group flex items-center gap-0.5">
              <NavLink to={`/projects/${project.id}`} className={projectNavClass}>
                <FolderOpen size={13} className="shrink-0" />
                <span className="truncate">{project.title}</span>
              </NavLink>
              <button
                onClick={() => projects.delete(project.id).then(() => navigate('/'))}
                className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                title="Удалить проект"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {addingProject ? (
            <InlineCreate
              placeholder="Название проекта..."
              onSubmit={handleAddProject}
              onCancel={() => setAddingProject(false)}
            />
          ) : (
            <button
              onClick={() => setAddingProject(true)}
              className="flex items-center gap-1.5 w-full px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded"
            >
              <Plus size={11} />
              Добавить проект
            </button>
          )}
        </div>
      )}
    </div>
  )
}
