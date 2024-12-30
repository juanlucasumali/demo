import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface NavigationStep {
  id: string
  name: string
  timestamp: number
}

export function useNavigationHistory(currentFolderId: string | null, currentFolderName: string | null) {
  const [path, setPath] = useState<NavigationStep[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentFolderId || !currentFolderName) {
      // Reset path when returning to home
      localStorage.removeItem('navigationPath')
      setPath([])
      return
    }

    const storedPath = localStorage.getItem('navigationPath')
    let currentPath: NavigationStep[] = storedPath ? JSON.parse(storedPath) : []

    // Check if we're navigating to a folder that's already in our path
    const existingIndex = currentPath.findIndex(step => step.id === currentFolderId)
    if (existingIndex !== -1) {
      // If we're clicking a previous folder, truncate the path
      currentPath = currentPath.slice(0, existingIndex + 1)
    } else {
      // Add new step
      currentPath.push({
        id: currentFolderId,
        name: currentFolderName,
        timestamp: Date.now()
      })
    }

    // Keep only last 10 steps
    if (currentPath.length > 10) {
      currentPath = currentPath.slice(-10)
    }

    localStorage.setItem('navigationPath', JSON.stringify(currentPath))
    setPath(currentPath)
  }, [currentFolderId, currentFolderName])

  return path
} 