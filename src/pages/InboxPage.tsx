import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { TaskList } from '@/components/tasks/TaskList'

export function InboxPage() {
  const tasks = useLiveQuery(
    () => db.tasks.filter((t) => !t.projectId && !t.parentId).toArray(),
    [],
  )

  return <TaskList tasks={tasks ?? []} />
}
