import B2 from 'backblaze-b2';
import { ipcMain } from 'electron';
import { config } from './config';

class B2Service {
  private b2: any;
  private isAuthorized: boolean = false;

  constructor() {
    this.b2 = new B2({
      applicationKeyId: config.B2_APPLICATION_KEY_ID,
      applicationKey: config.B2_APPLICATION_KEY
    });
  }

  async authorize() {
    if (!this.isAuthorized) {
      try {
        console.log('Attempting B2 authorization...');
        await this.b2.authorize();
        console.log('B2 authorization successful');
        this.isAuthorized = true;
      } catch (error) {
        console.error('B2 authorization failed:', error);
        throw error;
      }
    }
  }

  async uploadFile(fileName: string, fileBuffer: Buffer) {
    try {
      await this.authorize();
      
      console.log('Getting upload URL for:', {
        bucketId: config.B2_BUCKET_ID,
        fileName,
        fileSize: fileBuffer.length
      });
      
      const { data: uploadUrlData } = await this.b2.getUploadUrl({
        bucketId: config.B2_BUCKET_ID
      });
  
      console.log('Got upload URL:', uploadUrlData);
  
      const { data } = await this.b2.uploadFile({
        uploadUrl: uploadUrlData.uploadUrl,
        uploadAuthToken: uploadUrlData.authorizationToken,
        fileName: fileName,
        data: fileBuffer,
        contentLength: fileBuffer.length,
        contentType: 'application/octet-stream'
      });
  
      console.log('Upload successful:', data);
      return data;
    } catch (error) {
      console.error('B2 upload error:', error);
      throw error;
    }
  }

  async downloadFile(fileName: string) {
    await this.authorize();

    const { data } = await this.b2.downloadFileByName({
      bucketName: config.B2_BUCKET_NAME,
      fileName: fileName,
      responseType: 'arraybuffer'
    });

    return Buffer.from(data);
  }

    async getFileInfo(fileName: string) {
    await this.authorize();
    
    try {
      // List file versions to get the fileId
      const { data } = await this.b2.listFileVersions({
        bucketId: config.B2_BUCKET_ID,
        startFileName: fileName,
        maxFileCount: 1
      });

      if (!data.files || data.files.length === 0) {
        throw new Error('File not found in B2');
      }

      return data.files[0];
    } catch (error) {
      console.error('Error getting file info from B2:', error);
      throw error;
    }
  }

  async deleteFile(fileName: string) {
    await this.authorize();

    try {
      // Get file info first
      const fileInfo = await this.getFileInfo(fileName);
      
      console.log('Deleting file from B2:', {
        fileName: fileInfo.fileName,
        fileId: fileInfo.fileId
      });

      const { data } = await this.b2.deleteFileVersion({
        fileName: fileInfo.fileName,
        fileId: fileInfo.fileId
      });

      return data;
    } catch (error) {
      console.error('B2 delete error:', error);
      throw error;
    }
  }
}

// Create B2 service instance
const b2Service = new B2Service();

// Register IPC handlers
ipcMain.handle('b2-upload-file', async (_, { fileName, fileBuffer }) => {
  try {
    return await b2Service.uploadFile(fileName, Buffer.from(fileBuffer));
  } catch (error) {
    console.error('B2 upload error:', error);
    throw error;
  }
});

ipcMain.handle('b2-download-file', async (_, { fileName }) => {
  try {
    return await b2Service.downloadFile(fileName);
  } catch (error) {
    console.error('B2 download error:', error);
    throw error;
  }
});

ipcMain.handle('b2-delete-file', async (_, { fileName }) => {
    try {
      return await b2Service.deleteFile(fileName);
    } catch (error) {
      console.error('B2 delete error:', error);
      throw error;
    }
  });

export default b2Service;
