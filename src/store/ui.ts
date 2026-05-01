import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewMode, TaskFilters } from '@/types'

interface UIState {
  viewMode: ViewMode
  filters: TaskFilters
  selectedGoalId: string | null
  selectedProjectId: string | null

  setViewMode: (mode: ViewMode) => void
  setFilters: (filters: Partial<TaskFilters>) => void
  resetFilters: () => void
  selectGoal: (id: string | null) => void
  selectProject: (id: string | null) => void
}

const defaultFilters: TaskFilters = {}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewMode: 'list',
      filters: defaultFilters,
      selectedGoalId: null,
      selectedProjectId: null,

      setViewMode: (viewMode) => set({ viewMode }),

      setFilters: (incoming) =>
        set((state) => ({ filters: { ...state.filters, ...incoming } })),

      resetFilters: () => set({ filters: defaultFilters }),

      selectGoal: (id) => set({ selectedGoalId: id, selectedProjectId: null }),

      selectProject: (id) => set({ selectedProjectId: id }),
    }),
    {
      name: 'goalflow-ui',
      // сохраняем только вид и выбранный контекст, не фильтры
      partialize: (state) => ({
        viewMode: state.viewMode,
        selectedGoalId: state.selectedGoalId,
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
)
