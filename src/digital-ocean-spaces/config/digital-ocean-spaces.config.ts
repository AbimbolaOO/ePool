import { ConfigService } from '@nestjs/config';

import { DigitalOceanSpacesOptionsInterface } from '../interfaces';

export const digitalOceanSpacesConfigFactory = (
  configService: ConfigService,
): DigitalOceanSpacesOptionsInterface => {
  const accessKeyId = configService.get<string>('DO_SPACES_ACCESS_KEY_ID');
  const secretAccessKey = configService.get<string>(
    'DO_SPACES_SECRET_ACCESS_KEY',
  );
  const bucketName = configService.get<string>('DO_SPACES_BUCKET_NAME');

  if (!accessKeyId) {
    throw new Error('DO_SPACES_ACCESS_KEY_ID environment variable is required');
  }

  if (!secretAccessKey) {
    throw new Error(
      'DO_SPACES_SECRET_ACCESS_KEY environment variable is required',
    );
  }

  if (!bucketName) {
    throw new Error('DO_SPACES_BUCKET_NAME environment variable is required');
  }

  return {
    accessKeyId,
    secretAccessKey,
    region: configService.get<string>('DO_SPACES_REGION', 'fra1'),
    bucketName,
    endpoint: configService.get<string>('DO_SPACES_ENDPOINT'),
  };
};

export const digitalOceanSpacesConfig = {
  provide: 'DIGITAL_OCEAN_SPACES_CONFIG',
  useFactory: digitalOceanSpacesConfigFactory,
  inject: [ConfigService],
};
