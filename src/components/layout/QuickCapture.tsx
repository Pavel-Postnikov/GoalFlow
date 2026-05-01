import { useEffect, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import { tasks } from '@/db/queries'

export function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setValue('')
      // небольшой таймаут чтобы modal успел смонтироваться
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  async function handleSubmit() {
    const title = value.trim()
    if (!title) return
    await tasks.create({ title })
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Zap size={16} className="text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Быстрая задача в Inbox..."
            className="flex-1 text-sm text-zinc-900 bg-transparent outline-none placeholder:text-zinc-400"
          />
          <kbd className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded font-mono">
            esc
          </kbd>
        </div>

        <div className="border-t border-zinc-100 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Добавит в Inbox</span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}
