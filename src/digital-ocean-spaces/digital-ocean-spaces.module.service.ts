import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import { URL } from 'url';

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { DigitalOceanSpacesOptionsInterface } from './interfaces';
import { DIGITAL_OCEAN_SPACES_OPTIONS } from './tokens';
import {
  BulkUploadResult,
  DeleteFileOptions,
  FileUploadOptions,
  FileUploadResult,
  SupportedFileType,
  UrlUploadOptions,
} from './types/upload.types';

@Injectable()
export class DigitalOceanSpacesService {
  private readonly logger = new Logger(DigitalOceanSpacesService.name);
  private readonly s3: S3Client;
  private readonly region: string;
  private readonly endpoint: string;

  constructor(
    @Inject(DIGITAL_OCEAN_SPACES_OPTIONS)
    private readonly options: DigitalOceanSpacesOptionsInterface,
  ) {
    // Auto-detect region and endpoint
    const { region, endpoint } = this.determineRegionAndEndpoint();
    this.region = region;
    this.endpoint = endpoint;

    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.options.accessKeyId,
        secretAccessKey: this.options.secretAccessKey,
      },
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: false,
    });
  }

  private determineRegionAndEndpoint(): { region: string; endpoint: string } {
    // If endpoint is explicitly provided, use it
    if (this.options.endpoint) {
      const region = this.extractRegionFromEndpoint(this.options.endpoint);
      return { region, endpoint: this.options.endpoint };
    }

    // If region is provided, construct endpoint
    if (this.options.region) {
      return {
        region: this.options.region,
        endpoint: `https://${this.options.region}.digitaloceanspaces.com`,
      };
    }

    // Default to fra1 (your current region based on comments)
    const defaultRegion = 'fra1';
    return {
      region: defaultRegion,
      endpoint: `https://${defaultRegion}.digitaloceanspaces.com`,
    };
  }

  private extractRegionFromEndpoint(endpoint: string): string {
    try {
      const url = new URL(endpoint);
      const hostname = url.hostname;
      // Extract region from hostname like "fra1.digitaloceanspaces.com"
      const match = hostname.match(/^([^.]+)\.digitaloceanspaces\.com$/);
      return match ? match[1] : 'fra1'; // fallback to fra1
    } catch {
      return 'fra1'; // fallback to fra1
    }
  }

  private async s3Upload(
    file: any,
    bucket: string,
    name: string,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    const { folderName, makePublic = true, contentType } = options;
    const key = folderName
      ? `${folderName}/${encodeURIComponent(name)}`
      : encodeURIComponent(name);

    const params = {
      Bucket: bucket,
      Key: key,
      Body: file,
      ...(makePublic && { ACL: 'public-read' as ObjectCannedACL }),
    };

    if (contentType) {
      params['ContentType'] = contentType;
    }

    const command = new PutObjectCommand(params);

    try {
      const result = await this.s3.send(command);
      const url = `https://${params.Bucket}.${this.region}.digitaloceanspaces.com/${params.Key}`;

      this.logger.log(`File uploaded successfully: ${url}`);

      return {
        url,
        key: params.Key,
        bucket: params.Bucket,
        contentType: contentType || 'application/octet-stream',
      };
    } catch (error) {
      this.logger.error('Error uploading file to Digital Ocean Spaces:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    const { originalname, buffer, mimetype } = file;
    const { existingFileName, folderName } = options;

    const filename = existingFileName
      ? this.extractPathFromImgUrl(existingFileName)
      : this.generateFileName(originalname);

    return this.s3Upload(buffer, this.options.bucketName, filename, {
      ...options,
      folderName,
      contentType: mimetype,
    });
  }

  async uploadFileFromUrl(
    url: string,
    options: UrlUploadOptions = {},
  ): Promise<FileUploadResult> {
    try {
      const [fileBuffer, contentType] = await this.getFileBufferFromUrl(url);
      const { existingFileName } = options;

      const filename = existingFileName
        ? this.extractPathFromImgUrl(existingFileName)
        : this.generateFileName(`image.${contentType.split('/')[1]}`);

      return this.s3Upload(fileBuffer, this.options.bucketName, filename, {
        contentType,
        makePublic: true,
      });
    } catch (error) {
      this.logger.error('Error uploading file from URL:', error);
      throw new Error(`Failed to upload file from URL: ${error.message}`);
    }
  }

  private async getFileBufferFromUrl(url: string): Promise<[Buffer, string]> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file from URL: ${url}. Status: ${response.status}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';

    // Use temporary file approach to ensure consistent buffer handling
    const tempFile = tmp.fileSync();
    try {
      fs.writeFileSync(tempFile.name, Buffer.from(arrayBuffer));
      const fileContent = fs.readFileSync(tempFile.name);
      return [fileContent, contentType];
    } finally {
      // Clean up temporary file
      tempFile.removeCallback();
    }
  }

  async deleteFile(
    fileUrl: string,
    options: DeleteFileOptions = {},
  ): Promise<void> {
    try {
      const fileKey = this.extractPathFromImgUrlWithFolderName(fileUrl);
      const params = {
        Bucket: this.options.bucketName,
        Key: fileKey,
      };
      const command = new DeleteObjectCommand(params);

      await this.s3.send(command);
      this.logger.log(`File deleted successfully: ${fileUrl}`);
    } catch (error) {
      if (options.suppressErrors) {
        this.logger.warn(
          `Failed to delete file (suppressed): ${fileUrl}`,
          error.message,
        );
        return;
      }
      this.logger.error(
        'Error deleting file from Digital Ocean Spaces:',
        error,
      );
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Check if a file exists in the space
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const fileKey = this.extractPathFromImgUrlWithFolderName(fileUrl);
      const params = {
        Bucket: this.options.bucketName,
        Key: fileKey,
      };
      const command = new HeadObjectCommand(params);
      await this.s3.send(command);
      return true;
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      this.logger.error('Error checking file existence:', error);
      throw new Error(`Failed to check file existence: ${error.message}`);
    }
  }

  /**
   * Upload multiple files at once
   */
  async uploadMultipleFiles(
    files: SupportedFileType[],
    options: FileUploadOptions = {},
  ): Promise<BulkUploadResult> {
    const successful: FileUploadResult[] = [];
    const failed: Array<{ file: SupportedFileType; error: Error }> = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, options);
        successful.push(result);
      } catch (error) {
        failed.push({ file, error: error as Error });
      }
    }

    return { successful, failed };
  }

  // private generateFileName(originalname: string): string {
  //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //   const fileExtension = path.extname(originalname);
  //   const basename = path.parse(originalname).name;
  //   return `${encodeURIComponent(basename)}-${uniqueSuffix}${fileExtension}`;
  // }

  private generateFileName(originalname: string): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(originalname);
    // const basename = path.parse(originalname).name;

    // Encode only the base name, but not the extension
    // const safeBasename = encodeURIComponent(basename)
    //   .replace(/\(/g, '')
    //   .replace(/\)/g, '');

    // return `${safeBasename}-${uniqueSuffix}${fileExtension}`;
    return `${uniqueSuffix}${fileExtension}`;
  }

  private extractPathFromImgUrl(url: string): string {
    const myURL = new URL(url);
    // return myURL.pathname.split('/').pop();
    return decodeURIComponent(myURL.pathname.split('/').pop());
  }

  private extractPathFromImgUrlWithFolderName(fileUrl: string): string {
    const url = new URL(fileUrl);
    return url.pathname.substring(1);
  }
}
