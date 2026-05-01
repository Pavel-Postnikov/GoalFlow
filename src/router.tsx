import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { InboxPage } from '@/pages/InboxPage'
import { GoalPage } from '@/pages/GoalPage'
import { ProjectPage } from '@/pages/ProjectPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <InboxPage /> },
      { path: 'goals/:goalId', element: <GoalPage /> },
      { path: 'projects/:projectId', element: <ProjectPage /> },
    ],
  },
])
