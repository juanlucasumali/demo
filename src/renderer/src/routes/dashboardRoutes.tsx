import MyFiles from '../components/dashboard/MyFiles/MyFiles'
import { Connect } from '../components/dashboard/Connect/Connect'

export const dashboardRoutes = [
  {
    path: '',
    element: <MyFiles />,
  },
  {
    path: 'files',
    element: <MyFiles />,
  },
    {
    path: 'files/:folderId',  // Add this route for folder navigation
    element: <MyFiles />,
  },
  {
    path: 'models',
    element: <div>Models View</div>,
  },
  {
    path: 'documentation',
    element: <div>Documentation View</div>,
  },
  {
    path: 'connect',
    element: <Connect />,
  },
  {
    path: 'settings',
    element: <div>Settings View</div>,
  },
]
