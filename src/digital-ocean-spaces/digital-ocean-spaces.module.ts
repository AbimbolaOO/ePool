import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DigitalOceanSpacesService } from './digital-ocean-spaces.module.service';
import {
  DigitalOceanSpacesConfigAsync,
  DigitalOceanSpacesOptionsInterface,
} from './interfaces';
import { DIGITAL_OCEAN_SPACES_OPTIONS } from './tokens';

@Global()
@Module({})
export class DigitalOceanSpacesModule {
  /**
   * Register the module synchronously with provided options
   */
  static forRoot(options: DigitalOceanSpacesOptionsInterface): DynamicModule {
    return {
      module: DigitalOceanSpacesModule,
      providers: [
        {
          provide: DIGITAL_OCEAN_SPACES_OPTIONS,
          useValue: options,
        },
        DigitalOceanSpacesService,
      ],
      exports: [DigitalOceanSpacesService],
    };
  }

  /**
   * Register the module asynchronously with factory
   */
  static forRootAsync(options: DigitalOceanSpacesConfigAsync): DynamicModule {
    return {
      module: DigitalOceanSpacesModule,
      imports: [...(options.imports || [])],
      providers: [
        ...this.createAsyncProviders(options),
        DigitalOceanSpacesService,
      ],
      exports: [DigitalOceanSpacesService],
    };
  }

  /**
   * Create async providers for the module
   */
  private static createAsyncProviders(
    options: DigitalOceanSpacesConfigAsync,
  ): Provider[] {
    return [
      {
        provide: DIGITAL_OCEAN_SPACES_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }

  /**
   * Convenient method for common configuration from environment variables
   */
  static forRootFromEnv(): DynamicModule {
    return this.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): DigitalOceanSpacesOptionsInterface => ({
        accessKeyId: configService.getOrThrow<string>(
          'DO_SPACES_ACCESS_KEY_ID',
        ),
        secretAccessKey: configService.getOrThrow<string>(
          'DO_SPACES_SECRET_ACCESS_KEY',
        ),
        region: configService.get<string>('DO_SPACES_REGION', 'fra1'),
        bucketName: configService.getOrThrow<string>('DO_SPACES_BUCKET_NAME'),
        endpoint: configService.get<string>('DO_SPACES_ENDPOINT'),
      }),
    });
  }
}
