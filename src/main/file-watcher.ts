import chokidar, { FSWatcher } from 'chokidar'
import path from 'path'
import { BrowserWindow } from 'electron'

// Store active watchers by sync configuration ID
const activeWatchers = new Map<number, FSWatcher>()

export function startWatching(syncId: number, directoryPath: string) {
  // Close existing watcher if any
  stopWatching(syncId)

  const watcher = chokidar.watch(directoryPath, {
    persistent: true,
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../, // Ignore hidden files
    depth: 99,
    followSymlinks: false,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  })

  watcher
    .on('add', (filePath) => {
      const relativePath = path.relative(directoryPath, filePath)
      notifyRenderer('file-added', syncId, {
        name: path.basename(filePath),
        path: relativePath,
        type: 'file'
      })
    })
    .on('change', (filePath) => {
      const relativePath = path.relative(directoryPath, filePath)
      notifyRenderer('file-modified', syncId, {
        name: path.basename(filePath),
        path: relativePath,
        type: 'file'
      })
    })
    .on('unlink', (filePath) => {
      const relativePath = path.relative(directoryPath, filePath)
      notifyRenderer('file-removed', syncId, {
        name: path.basename(filePath),
        path: relativePath,
        type: 'file'
      })
    })
    .on('addDir', (dirPath) => {
      if (dirPath === directoryPath) return
      const relativePath = path.relative(directoryPath, dirPath)
      notifyRenderer('folder-added', syncId, {
        name: path.basename(dirPath),
        path: relativePath,
        type: 'folder'
      })
    })
    .on('unlinkDir', (dirPath) => {
      const relativePath = path.relative(directoryPath, dirPath)
      notifyRenderer('folder-removed', syncId, {
        name: path.basename(dirPath),
        path: relativePath,
        type: 'folder'
      })
    })
    .on('error', (error: any) => {
      console.error('Watcher error:', error)
      notifyRenderer('watcher-error', syncId, { error: error.message })
    })

  activeWatchers.set(syncId, watcher)
}

export function stopWatching(syncId: number) {
  const existingWatcher = activeWatchers.get(syncId)
  if (existingWatcher) {
    existingWatcher.close()
    activeWatchers.delete(syncId)
  }
}

function notifyRenderer(event: string, syncId: number, data: any) {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('file-system-event', {
      type: event,
      syncId,
      data
    })
  })
} 