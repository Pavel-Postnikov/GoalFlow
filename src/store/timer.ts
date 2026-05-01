import { create } from 'zustand'
import { timeEntries } from '@/db/queries'
import type { ActiveTimer } from '@/types'

interface TimerState {
  active: ActiveTimer | null

  start: (taskId: string, taskTitle: string) => Promise<void>
  stop: () => Promise<void>
}

export const useTimerStore = create<TimerState>((set, get) => ({
  active: null,

  start: async (taskId, taskTitle) => {
    const current = get().active
    if (current) await timeEntries.stop(current.timeEntryId)

    const timeEntryId = await timeEntries.start(taskId)
    set({ active: { taskId, taskTitle, startedAt: new Date(), timeEntryId } })
  },

  stop: async () => {
    const current = get().active
    if (!current) return

    await timeEntries.stop(current.timeEntryId)
    set({ active: null })
  },
}))
