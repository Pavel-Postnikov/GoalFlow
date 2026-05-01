import { useState } from 'react'
import { Plus } from 'lucide-react'
import { tasks } from '@/db/queries'
import { InlineCreate } from '@/components/layout/InlineCreate'

interface Props {
  projectId?: string
}

export function QuickAddTask({ projectId }: Props) {
  const [adding, setAdding] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  async function handleSubmit(title: string) {
    await tasks.create({ title, projectId })
    setInputKey((k) => k + 1)
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
      >
        <Plus size={15} />
        Добавить задачу
      </button>
    )
  }

  return (
    <div className="mt-1 space-y-1">
      <InlineCreate
        key={inputKey}
        placeholder="Название задачи..."
        onSubmit={handleSubmit}
        onCancel={() => setAdding(false)}
      />
      <p className="text-xs text-zinc-400 px-3">Enter — сохранить · Escape — закрыть</p>
    </div>
  )
}
