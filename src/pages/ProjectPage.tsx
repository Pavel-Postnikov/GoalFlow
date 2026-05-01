import { useParams } from 'react-router-dom'

export function ProjectPage() {
  const { projectId } = useParams()
  return (
    <div className="text-zinc-400 text-sm">
      Проект: {projectId}
    </div>
  )
}
