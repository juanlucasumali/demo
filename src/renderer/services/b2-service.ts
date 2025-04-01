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
    // console.log('🚀 Initializing B2Service with config:', {
    //   keyId: B2_CONFIG.applicationKeyId.substring(0, 8) + '...',
    //   bucketId: B2_CONFIG.bucketId
    // });
    
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
      // console.log('🔑 Starting B2 authorization...');
      try {
        const authResponse = await this.b2.authorize();
        this.authorized = true;
        // console.log('✅ B2 authorization successful:', {
        //   accountId: authResponse.data?.accountId,
        //   apiUrl: authResponse.data?.apiUrl,
        //   downloadUrl: authResponse.data?.downloadUrl
        // });
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
      // console.log('Getting new upload URL...');
      try {
        const response = await this.b2.getUploadUrl({
          bucketId: B2_CONFIG.bucketId
        });
        this.uploadUrl = response.data.uploadUrl;
        this.uploadAuthToken = response.data.authorizationToken;
        // console.log('Got new upload URL:', this.uploadUrl);
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

  async uploadFile(fileName: string, data: ArrayBuffer): Promise<string> {
    // console.log('📤 Starting file upload:', {
    //   fileName,
    //   sizeBytes: data.byteLength,
    //   sizeMB: (data.byteLength / (1024 * 1024)).toFixed(2) + 'MB'
    // });

    await this.ensureAuthorized();
    
    try {
      const { uploadUrl, uploadAuthToken } = await this.getUploadUrl();
      if (!uploadUrl) throw new Error('Failed to get upload URL');
      
      // console.log('📍 Got upload URL:', { uploadUrl });
      
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
      // console.log('✅ Upload successful:', {
      //   fileId: result.fileId,
      //   fileName: result.fileName,
      //   contentLength: result.contentLength
      // });
      
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
    // console.log(`⬇️ Starting B2 download for fileId: ${fileId}`);
    await this.ensureAuthorized();

    try {
      // console.log('🔄 Making B2 download request...');
      const response = await this.b2.downloadFileById({
        fileId,
        responseType: 'arraybuffer',
        // onDownloadProgress: (event: any) => {
          // const progress = Math.round((event.loaded * 100) / event.total);
          // console.log(`📊 Download progress: ${progress}%`);
        // }
      });

      // console.log('📦 B2 download response:', {
      //   status: response.status,
      //   headers: response.headers,
      //   dataType: Object.prototype.toString.call(response.data),
      //   dataLength: response.data?.byteLength
      // });

      return response.data;
    } catch (error) {
      console.error('❌ B2 download failed:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string, fileName: string): Promise<void> {
    // console.log(`Deleting file: ${fileName} (${fileId})`);
    await this.ensureAuthorized();

    try {
      await this.b2.deleteFileVersion({
        fileId,
        fileName: encodeURIComponent(fileName)
      });
      // console.log('File deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error, {
        fileId,
        fileName: encodeURIComponent(fileName)
      });
      throw error;
    }
  }
  
  generatePath = (type: 'avatar' | 'file' | 'folder', metadata: {
    userId: string,
    fileId: string,
    fileName: string
  }) => {
    const timestamp = Date.now();
    const sanitizedName = metadata.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${type}/${metadata.userId}/${timestamp}_${metadata.fileId}_${sanitizedName}`;
  } 

  async storeAvatar(userId: string, fileId: string, fileName: string, data: ArrayBuffer): Promise<string> {
    const storagePath = this.generatePath('avatar', {userId, fileId, fileName});
    // console.log(`Storing avatar at path: ${storagePath}`);
    
    try {
      const b2FileId = await this.uploadFile(storagePath, data);
      // console.log(`Avatar stored successfully with B2 fileId: ${b2FileId}`);
      return b2FileId;
    } catch (error) {
      console.error('Failed to store avatar:', error);
      throw error;
    }
  }

  async storeFile(userId: string, fileId: string, fileName: string, data: ArrayBuffer): Promise<string> {
    const storagePath = this.generatePath('file', {userId, fileId, fileName});
    // console.log(`Storing file at path: ${storagePath}`);
    
    try {
      const b2FileId = await this.uploadFile(storagePath, data);
      // console.log(`File stored successfully with B2 fileId: ${b2FileId}`);
      return b2FileId;
    } catch (error) {
      console.error('Failed to store file:', error);
      throw error;
    }
  }

  async retrieveFile(b2FileId: string): Promise<ArrayBuffer> {
    // console.log(`🎯 Retrieving file with B2 fileId: ${b2FileId}`);
    try {
      const data = await this.downloadFile(b2FileId);
      // console.log('📦 Retrieved file data:', {
      //   byteLength: data.byteLength,
      //   type: Object.prototype.toString.call(data),
      //   hasData: new Uint8Array(data).some(byte => byte !== 0)
      // });
      return data;
    } catch (error) {
      console.error('❌ Failed to retrieve file:', error);
      throw error;
    }
  }

  async removeFile(b2FileId: string, fileName: string): Promise<void> {
    // console.log('🗑️ B2 removeFile called with:', {
    //   b2FileId,
    //   fileName,
    //   authToken: this.uploadAuthToken ? 'present' : 'missing',
    //   apiUrl: this.uploadUrl ? 'present' : 'missing'
    // })

    // Ensure we're authorized
    if (!this.authorized) {
      // console.log('🔑 Reauthorizing B2 service before delete...')
      await this.ensureAuthorized()
    }

    try {
      // Get file info first to get the full path
      const fileInfo = await this.b2.getFileInfo({
        fileId: b2FileId
      })
      
      // console.log('📄 File info:', fileInfo.data)

      // Use the actual B2 fileName from the file info
      await this.b2.deleteFileVersion({
        fileId: b2FileId,
        fileName: fileInfo.data.fileName
      })
      
      // console.log('✅ B2 delete successful for:', fileInfo.data.fileName)
    } catch (error: any) {
      console.error('❌ B2 delete error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          fileName,
          fileId: b2FileId
        }
      })
      throw error
    }
  }

  async getUserStorageUsage(userId: string): Promise<{ used: number }> {
    await this.ensureAuthorized();
    
    try {
      let totalSize = 0;
      let startFileName = '';
      let moreFiles = true;
      
      // List all files in the user's directory
      while (moreFiles) {
        const response = await this.b2.listFileNames({
          bucketId: B2_CONFIG.bucketId,
          prefix: `file/${userId}/`, // This matches your file path pattern
          startFileName,
          maxFileCount: 1000
        });
        
        // Sum up the sizes of all files
        response.data.files.forEach((file: any) => {
          totalSize += file.contentLength;
        });
        
        // Check if there are more files to fetch
        if (response.data.nextFileName) {
          startFileName = response.data.nextFileName;
        } else {
          moreFiles = false;
        }
      }
      
      return { used: totalSize };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      throw error;
    }
  }
}

export const b2Service = new B2Service(); 