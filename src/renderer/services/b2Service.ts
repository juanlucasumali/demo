import axios, { AxiosError } from 'axios'
import { generateStoragePath } from '@/renderer/lib/utils'

const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB chunks

export const mediaService = {
  getAvatarUrl: async (avatarPath: string | null) => {
    console.log("Getting avatarUrl from avatarPath:", avatarPath)
    if (!avatarPath) {
      console.log("No avatarPath found")
      return null
    } else {
      const publicUrl = await b2Service.getPublicUrl(avatarPath)
      console.log("publicUrl found:", publicUrl)
      return publicUrl
    }
  }
}

async function calculateSha1(file: File): Promise<string> {
    // For files smaller than chunk size, use simple calculation
    if (file.size <= CHUNK_SIZE) {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-1', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
  
    // For larger files, use chunked calculation
    const chunks: ArrayBuffer[] = []
    let position = 0
  
    while (position < file.size) {
      const chunk = await file.slice(position, position + CHUNK_SIZE).arrayBuffer()
      chunks.push(chunk)
      position += CHUNK_SIZE
    }
  
    // Create a combined hash
    const hashBuffers = await Promise.all(
      chunks.map(chunk => crypto.subtle.digest('SHA-1', chunk))
    )
  
    // Combine hash buffers
    const combinedArray = hashBuffers.reduce((acc, curr) => {
      const array = new Uint8Array(curr)
      return [...acc, ...array]
    }, [] as number[])
  
    // Calculate final hash
    const finalHashBuffer = await crypto.subtle.digest(
      'SHA-1',
      new Uint8Array(combinedArray)
    )
  
    const hashArray = Array.from(new Uint8Array(finalHashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  async function calculateSha1WithProgress(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (file.size <= CHUNK_SIZE) {
      onProgress?.(0)
      const result = await calculateSha1(file)
      onProgress?.(100)
      return result
    }
  
    const chunks: ArrayBuffer[] = []
    let position = 0
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let processedChunks = 0
  
    while (position < file.size) {
      const chunk = await file.slice(position, position + CHUNK_SIZE).arrayBuffer()
      chunks.push(chunk)
      position += CHUNK_SIZE
      processedChunks++
      onProgress?.(Math.round((processedChunks / totalChunks) * 100))
    }
  
    const hashBuffers = await Promise.all(
      chunks.map(chunk => crypto.subtle.digest('SHA-1', chunk))
    )
  
    const combinedArray = hashBuffers.reduce((acc, curr) => {
      const array = new Uint8Array(curr)
      return [...acc, ...array]
    }, [] as number[])
  
    const finalHashBuffer = await crypto.subtle.digest(
      'SHA-1',
      new Uint8Array(combinedArray)
    )
  
    const hashArray = Array.from(new Uint8Array(finalHashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  
  interface B2File {
    fileId: string
    fileName: string
    uploadTimestamp: number
  }
  
  interface B2AuthResponse {
    authorizationToken: string
    apiUrl: string
    downloadUrl: string
  }
  
  export class B2Service {
    private static instance: B2Service
    private authToken: string | null = null
    private apiUrl: string | null = null
    private downloadUrl: string | null = null
    private bucketId = import.meta.env.VITE_B2_BUCKET_ID
    private bucketName = import.meta.env.VITE_B2_BUCKET_NAME
    private applicationKeyId = import.meta.env.VITE_B2_APPLICATION_KEY_ID
    private applicationKey = import.meta.env.VITE_B2_APPLICATION_KEY
    private authPromise: Promise<B2AuthResponse> | null = null
    private urlCache: Map<string, { url: string, expiry: number }> = new Map()
    private readonly CACHE_DURATION = 6 * 24 * 60 * 60 * 1000
  
    private constructor() {}
  
    static getInstance(): B2Service {
      if (!B2Service.instance) {
        B2Service.instance = new B2Service()
      }
      return B2Service.instance
    }
  
    private async authorize(): Promise<B2AuthResponse> {
      // Reuse existing auth promise if it exists
      if (this.authPromise) {
        return this.authPromise
      }
  
      this.authPromise = (async () => {
        try {
          const authString = Buffer.from(
            `${this.applicationKeyId}:${this.applicationKey}`
          ).toString('base64')
  
          const response = await axios.get<B2AuthResponse>(
            'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
            {
              headers: {
                Authorization: `Basic ${authString}`
              }
            }
          )
  
          this.authToken = response.data.authorizationToken
          this.apiUrl = response.data.apiUrl
          this.downloadUrl = response.data.downloadUrl
  
          return response.data
        } catch (error) {
          this.authPromise = null // Clear failed auth promise
          throw error
        }
      })()
  
      return this.authPromise
    }

    async getDownloadAuthorization(fileName: string) {
      try {
        const auth = await this.authorize()
        
        const response = await axios.post(
          `${auth.apiUrl}/b2api/v2/b2_get_download_authorization`,
          {
            bucketId: this.bucketId,
            fileNamePrefix: fileName,
            validDurationInSeconds: 604800, // 7 days
          },
          {
            headers: {
              Authorization: auth.authorizationToken
            }
          }
        )
  
        return response.data.authorizationToken
      } catch (error) {
        console.error('Error getting download authorization:', error)
        throw error
      }
    }
  
    private async getUploadUrl() {
      const auth = await this.authorize()
  
      try {
        const response = await axios.post(
          `${auth.apiUrl}/b2api/v2/b2_get_upload_url`,
          { bucketId: this.bucketId },
          {
            headers: {
              Authorization: auth.authorizationToken
            }
          }
        )
  
        return response.data
      } catch (error) {
        if (this.isAuthError(error)) {
          this.authPromise = null // Clear expired auth
          throw error
        }
        throw error
      }
    }
  
    private isAuthError(error: unknown): boolean {
      return (
        error instanceof AxiosError &&
        (error.response?.status === 401 || error.response?.status === 403)
      )
    }
  
    async uploadFile(
      file: File, 
      userId: string, 
      fileType: 'image' | 'audio',
      onHashProgress?: (progress: number) => void,
      onUploadProgress?: (progress: number) => void
    ) {
      try {
        const { uploadUrl, authorizationToken } = await this.getUploadUrl()
  
        const storagePath = generateStoragePath({
          userId,
          fileName: file.name,
          fileType,
        })
  
        // Calculate SHA1 hash with progress
        const sha1 = await calculateSha1WithProgress(file, onHashProgress)
        
        const response = await axios.post(uploadUrl, file, {
          headers: {
            Authorization: authorizationToken,
            'X-Bz-File-Name': encodeURIComponent(storagePath),
            'Content-Type': file.type,
            'Content-Length': file.size,
            'X-Bz-Content-Sha1': sha1,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total!
            )
            onUploadProgress?.(percentCompleted)
          }
        })
  
        // Wait for the public URL to be generated
        const url = await this.getPublicUrl(storagePath)
  
        return {
          fileName: storagePath,
          fileId: response.data.fileId,
          url
        }
      } catch (error) {
        console.error('B2 upload error:', error)
        throw this.normalizeError(error)
      }
    }
  
    async deleteFile(fileName: string) {
      try {
        const auth = await this.authorize()
  
        // First, find the file
        const fileVersions = await this.listFileVersions(fileName)
        
        if (fileVersions.length === 0) {
          console.log('File not found:', fileName)
          return // File doesn't exist, consider it deleted
        }
  
        // Delete all versions of the file
        await Promise.all(
          fileVersions.map(file =>
            axios.post(
              `${auth.apiUrl}/b2api/v2/b2_delete_file_version`,
              {
                fileName: file.fileName,
                fileId: file.fileId
              },
              {
                headers: {
                  Authorization: auth.authorizationToken
                }
              }
            )
          )
        )
      } catch (error) {
        if (this.isAuthError(error)) {
          this.authPromise = null
        }
        throw this.normalizeError(error)
      }
    }
  
    private async listFileVersions(fileName: string): Promise<B2File[]> {
      const auth = await this.authorize()
  
      try {
        const response = await axios.post(
          `${auth.apiUrl}/b2api/v2/b2_list_file_versions`,
          {
            bucketId: this.bucketId,
            startFileName: fileName,
            prefix: fileName,
            maxFileCount: 1000
          },
          {
            headers: {
              Authorization: auth.authorizationToken
            }
          }
        )
  
        return response.data.files.filter(
          (file: B2File) => file.fileName === fileName
        )
      } catch (error) {
        if (this.isAuthError(error)) {
          this.authPromise = null
        }
        throw this.normalizeError(error)
      }
    }
  
    private normalizeError(error: unknown): Error {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || error.message
        return new Error(`B2 Error: ${message}`)
      }
      return error instanceof Error ? error : new Error('Unknown error occurred')
    }
  
    async getPublicUrl(fileName: string) {
      if (!fileName) return null
  
      // Check memory cache first (fastest)
      const memoryCached = this.urlCache.get(fileName)
      if (memoryCached && memoryCached.expiry > Date.now()) {
        return memoryCached.url
      }
  
      // Check localStorage cache second (slower but persistent)
      const storageCached = localStorage.getItem(`b2_url_cache_${fileName}`)
      if (storageCached) {
        const { url, expiry } = JSON.parse(storageCached)
        if (expiry > Date.now()) {
          // Update memory cache
          this.urlCache.set(fileName, { url, expiry })
          return url
        }
        localStorage.removeItem(`b2_url_cache_${fileName}`)
      }
  
      // Generate new URL if no cache hit
      try {
        console.log("No cache hit for avatarPath, generating new URL")
        const auth = await this.authorize()
        const downloadAuth = await this.getDownloadAuthorization(fileName)
        
        const segments = fileName.split('/').map(segment => encodeURIComponent(segment))
        const encodedPath = segments.join('/')
        
        const baseUrl = auth.downloadUrl || 'https://f004.backblazeb2.com'
        const url = `${baseUrl}/file/${this.bucketName}/${encodedPath}?Authorization=${downloadAuth}`
        
        // Cache the URL in both memory and localStorage
        const expiry = Date.now() + this.CACHE_DURATION
        this.urlCache.set(fileName, { url, expiry })
        localStorage.setItem(
          `b2_url_cache_${fileName}`,
          JSON.stringify({ url, expiry })
        )
        
        return url
      } catch (error) {
        console.error('Error generating authorized URL:', error)
        throw error
      }
    }
  }
  
  export const b2Service = B2Service.getInstance()