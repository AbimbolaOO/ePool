export interface DigitalOceanSpacesOptionsInterface {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string; // Optional - will be auto-detected if not provided
  bucketName: string;
  endpoint?: string; // Optional - alternative to region
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  location: string;
}

export interface DigitalOceanSpacesConfigAsync {
  useFactory: (
    ...args: any[]
  ) =>
    | DigitalOceanSpacesOptionsInterface
    | Promise<DigitalOceanSpacesOptionsInterface>;
  inject?: any[];
  imports?: any[];
}

export interface DigitalOceanSpacesConfig {
  options: DigitalOceanSpacesOptionsInterface;
}
