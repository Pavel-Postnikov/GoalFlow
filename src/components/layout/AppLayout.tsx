import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
          <TaskDetailPanel />
        </div>
      </div>
    </div>
  )
}
