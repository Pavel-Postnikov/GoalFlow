import { useParams } from 'react-router-dom'

export function GoalPage() {
  const { goalId } = useParams()
  return (
    <div className="text-zinc-400 text-sm">
      Цель: {goalId}
    </div>
  )
}
