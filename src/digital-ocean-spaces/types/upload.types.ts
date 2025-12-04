import type { Multer } from 'multer';

export interface FileUploadOptions {
  folderName?: string;
  existingFileName?: string | null;
  makePublic?: boolean;
  contentType?: string;
}

export interface UrlUploadOptions {
  existingFileName?: string | null;
  makePublic?: boolean;
}

export interface DeleteFileOptions {
  suppressErrors?: boolean;
}

export type SupportedFileType = Express.Multer.File;

export interface FileUploadResult {
  url: string;
  key: string;
  bucket: string;
  size?: number;
  contentType?: string;
}

export interface BulkUploadResult {
  successful: FileUploadResult[];
  failed: Array<{
    file: SupportedFileType;
    error: Error;
  }>;
}
