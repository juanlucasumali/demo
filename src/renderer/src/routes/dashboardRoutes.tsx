import FileExplorer from '@renderer/pages/dashboard/FileExplorer'
import { Connect } from '../components/dashboard/Connect/Connect'

export const dashboardRoutes = [
  {
    path: '',
    element: <FileExplorer />,
  },
  {
    path: 'files',
    element: <FileExplorer />,
  },
    {
    path: 'files/:folderId',  // Add this route for folder navigation
    element: <FileExplorer />,
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
