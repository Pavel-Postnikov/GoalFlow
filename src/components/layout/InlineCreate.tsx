import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  placeholder: string
  onSubmit: (value: string) => void
  onCancel: () => void
  className?: string
}

export function InlineCreate({ placeholder, onSubmit, onCancel, className }: Props) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) onSubmit(value.trim())
    if (e.key === 'Escape') onCancel()
  }

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onCancel}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-1.5 text-sm bg-white border border-indigo-300 rounded-lg',
        'outline-none ring-2 ring-indigo-100 placeholder:text-zinc-400',
        className,
      )}
    />
  )
}
