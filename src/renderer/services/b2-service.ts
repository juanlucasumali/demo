import B2 from 'backblaze-b2';

// B2 Configuration
const B2_CONFIG = {
  applicationKeyId: import.meta.env.RENDERER_VITE_B2_APPLICATION_KEY_ID,
  applicationKey: import.meta.env.RENDERER_VITE_B2_APPLICATION_KEY,
  bucketId: import.meta.env.RENDERER_VITE_B2_BUCKET_ID
};

class B2Service {
  private b2: any;
  private authorized: boolean = false;
  private uploadUrl: string | null = null;
  private uploadAuthToken: string | null = null;

  constructor() {
    console.log('🚀 Initializing B2Service with config:', {
      keyId: B2_CONFIG.applicationKeyId.substring(0, 8) + '...',
      bucketId: B2_CONFIG.bucketId
    });
    
    // Override the getAuthHeaderObject method to use browser APIs
    const customAuth = {
      getAuthHeaderObject: (id: string, key: string) => {
        const authString = `${id}:${key}`;
        const base64Auth = btoa(authString);
        return {
          Authorization: `Basic ${base64Auth}`
        };
      }
    };
    
    this.b2 = new B2({
      applicationKeyId: B2_CONFIG.applicationKeyId,
      applicationKey: B2_CONFIG.applicationKey,
      retry: { retries: 3 },
      auth: customAuth // Use our custom auth implementation
    });
  }

  private async ensureAuthorized() {
    if (!this.authorized) {
      console.log('🔑 Starting B2 authorization...');
      try {
        const authResponse = await this.b2.authorize();
        this.authorized = true;
        console.log('✅ B2 authorization successful:', {
          accountId: authResponse.data?.accountId,
          apiUrl: authResponse.data?.apiUrl,
          downloadUrl: authResponse.data?.downloadUrl
        });
      } catch (error: any) {
        console.error('❌ B2 authorization failed:', {
          error,
          stack: error.stack
        });
        throw error;
      }
    }
  }

  private async getUploadUrl() {
    if (!this.uploadUrl || !this.uploadAuthToken) {
      console.log('Getting new upload URL...');
      try {
        const response = await this.b2.getUploadUrl({
          bucketId: B2_CONFIG.bucketId
        });
        this.uploadUrl = response.data.uploadUrl;
        this.uploadAuthToken = response.data.authorizationToken;
        console.log('Got new upload URL:', this.uploadUrl);
      } catch (error) {
        console.error('Failed to get upload URL:', error);
        throw error;
      }
    }
    return {
      uploadUrl: this.uploadUrl,
      uploadAuthToken: this.uploadAuthToken
    };
  }

  // Convert ArrayBuffer to base64 string
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Convert base64 string to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async uploadFile(fileName: string, data: ArrayBuffer): Promise<string> {
    console.log('📤 Starting file upload:', {
      fileName,
      sizeBytes: data.byteLength,
      sizeMB: (data.byteLength / (1024 * 1024)).toFixed(2) + 'MB'
    });

    await this.ensureAuthorized();
    
    try {
      const { uploadUrl, uploadAuthToken } = await this.getUploadUrl();
      if (!uploadUrl) throw new Error('Failed to get upload URL');
      
      console.log('📍 Got upload URL:', { uploadUrl });
      
      // Calculate SHA1 hash using Web Crypto API
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentSha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Use fetch directly instead of the B2 client
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': uploadAuthToken || '',
          'X-Bz-File-Name': encodeURIComponent(fileName),
          'Content-Type': 'b2/x-auto',
          'X-Bz-Content-Sha1': contentSha1
        },
        body: data
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', {
        fileId: result.fileId,
        fileName: result.fileName,
        contentLength: result.contentLength
      });
      
      return result.fileId;
    } catch (error: any) {
      console.error('❌ Upload failed:', {
        error,
        stack: error.stack,
        fileName
      });
      this.uploadUrl = null;
      this.uploadAuthToken = null;
      throw error;
    }
  }

  async downloadFile(fileId: string): Promise<ArrayBuffer> {
    console.log(`Starting download for file: ${fileId}`);
    await this.ensureAuthorized();

    try {
      const response = await this.b2.downloadFileById({
        fileId,
        responseType: 'arraybuffer',
        onDownloadProgress: (event: any) => {
          const progress = Math.round((event.loaded * 100) / event.total);
          console.log(`Download progress: ${progress}%`);
        }
      });

      console.log('Download successful');
      return response.data;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string, fileName: string): Promise<void> {
    console.log(`Deleting file: ${fileName} (${fileId})`);
    await this.ensureAuthorized();

    try {
      await this.b2.deleteFileVersion({
        fileId,
        fileName
      });
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  generateStoragePath(userId: string, fileId: string, fileName: string): string {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${userId}/${fileId}/${sanitizedFileName}`;
  }

  async storeFile(userId: string, fileId: string, fileName: string, data: ArrayBuffer): Promise<string> {
    const storagePath = this.generateStoragePath(userId, fileId, fileName);
    console.log(`Storing file at path: ${storagePath}`);
    
    try {
      const b2FileId = await this.uploadFile(storagePath, data);
      console.log(`File stored successfully with B2 fileId: ${b2FileId}`);
      return b2FileId;
    } catch (error) {
      console.error('Failed to store file:', error);
      throw error;
    }
  }

  async retrieveFile(b2FileId: string): Promise<ArrayBuffer> {
    console.log(`Retrieving file with B2 fileId: ${b2FileId}`);
    try {
      return await this.downloadFile(b2FileId);
    } catch (error) {
      console.error('Failed to retrieve file:', error);
      throw error;
    }
  }

  async removeFile(b2FileId: string, fileName: string): Promise<void> {
    console.log(`Removing file: ${fileName} (${b2FileId})`);
    try {
      await this.deleteFile(b2FileId, fileName);
      console.log('File removed successfully');
    } catch (error) {
      console.error('Failed to remove file:', error);
      throw error;
    }
  }
}

export const b2Service = new B2Service(); 