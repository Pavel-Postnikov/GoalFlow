import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { TaskList } from '@/components/tasks/TaskList'

export function ProjectPage() {
  const { projectId } = useParams()

  const tasks = useLiveQuery(
    () =>
      projectId
        ? db.tasks
            .where('projectId')
            .equals(projectId)
            .filter((t) => !t.parentId)
            .toArray()
        : [],
    [projectId],
  )

  return <TaskList tasks={tasks ?? []} projectId={projectId} />
}
