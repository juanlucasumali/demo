import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Lame } from 'node-lame'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600, 
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true, 
      contextIsolation: false,
      sandbox: false,
      zoomFactor: 1.0  // Set initial zoom factor
    }
  })

    // Reset zoom factor when window is ready to show
    mainWindow.on('ready-to-show', () => {
      mainWindow.webContents.setZoomFactor(1.0)  // Reset zoom factor
      mainWindow.show()
    })

    // Set minimum and maximum zoom levels
    mainWindow.webContents.setVisualZoomLevelLimits(1, 5) // This allows zoom from 100% to 500%

    // Optional: Add zoom keyboard shortcuts
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control || input.meta) { // Ctrl on Windows/Linux, Cmd on Mac
        if (input.key === '=' || input.key === '+') {
          mainWindow.webContents.zoomFactor += 0.1
          event.preventDefault()
        } else if (input.key === '-') {
          mainWindow.webContents.zoomFactor -= 0.1
          event.preventDefault()
        } else if (input.key === '0') {
          mainWindow.webContents.zoomFactor = 1.0
          event.preventDefault()
        }
      }
    })

  // Add IPC handlers for zoom control
  ipcMain.on('zoom-in', () => {
    mainWindow.webContents.zoomFactor += 0.1
  })

  ipcMain.on('zoom-out', () => {
    mainWindow.webContents.zoomFactor -= 0.1
  })

  ipcMain.on('zoom-reset', () => {
    mainWindow.webContents.zoomFactor = 1.0
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Add these IPC handlers
ipcMain.handle('convert-to-mp3', async (_, arrayBuffer: ArrayBuffer) => {
  try {
    const tempDir = os.tmpdir()
    const inputPath = path.join(tempDir, `input-${Date.now()}.wav`)
    const outputPath = path.join(tempDir, `output-${Date.now()}.mp3`)

    // Convert ArrayBuffer to Uint8Array and write to file
    const uint8Array = new Uint8Array(arrayBuffer)
    fs.writeFileSync(inputPath, uint8Array)

    // Create encoder instance
    const encoder = new Lame({
      output: outputPath,
      bitrate: 192
    }).setFile(inputPath)

    // Encode the file
    await encoder.encode()

    // Read the result and convert to Uint8Array
    const result = new Uint8Array(fs.readFileSync(outputPath))

    // Clean up temporary files
    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)

    // Return the ArrayBuffer
    return result.buffer
  } catch (error) {
    console.error('Conversion error:', error)
    throw error
  }
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    throw new Error('No window found');
  }
  return dialog.showOpenDialog(window, options);
});

ipcMain.handle('create-folder-structure', async (_, { basePath, folders }) => {
  try {
    const createNestedFolders = async (folder: any, currentPath: string) => {
      const folderPath = path.join(currentPath, folder.name);
      
      try {
        await fs.promises.mkdir(folderPath, { recursive: true });

        if (folder.children) {
          for (const child of folder.children) {
            if (child.type === 'folder') {
              await createNestedFolders(child, folderPath);
            }
          }
        }
      } catch (error) {
        console.error(`Error creating folder ${folderPath}:`, error);
        throw error;
      }
    };

    for (const folder of folders) {
      if (folder.type === 'folder') {
        await createNestedFolders(folder, basePath);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error creating folder structure:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scan-directory', async (_, dirPath: string) => {

    // Add this function to check for files to ignore
      const isAllowedAudioFile = (filename: string): boolean => {
        const allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'];
        const extension = filename.toLowerCase().split('.').pop();
        return extension ? allowedExtensions.includes(extension) : false;
    };

  const scanDir = async (currentPath: string): Promise<any[]> => {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    const files = await Promise.all(
      entries
      .filter(entry => isAllowedAudioFile(entry.name))
      .map(async (entry) => {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          const children = await scanDir(fullPath);
          return {
            path: fullPath,
            name: entry.name,
            type: 'folder',
            children
          };
        }
        const stats = await fs.promises.stat(fullPath);
        return {
          path: fullPath,
          name: entry.name,
          size: stats.size,
          type: 'file'
        };
      })
    );
    return files;
  };

  try {
    return await scanDir(dirPath);
  } catch (error) {
    console.error('Error scanning directory:', error);
    throw error;
  }
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    return await fs.promises.readFile(filePath);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});