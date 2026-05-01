import type { Task } from '@/types'
import { TaskItem } from './TaskItem'
import { QuickAddTask } from './QuickAddTask'

interface Props {
  tasks: Task[]
  projectId?: string
}

export function TaskList({ tasks, projectId }: Props) {
  const todo = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="max-w-2xl">
      <div className="space-y-px">
        {todo.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          {todo.length > 0 && <div className="my-3 border-t border-zinc-100" />}
          <div className="space-y-px">
            {done.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </>
      )}

      <QuickAddTask projectId={projectId} />
    </div>
  )
}
