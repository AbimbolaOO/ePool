import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { User } from './auth/entity/user.entity';
import { PoolFile } from './pool/entity/pool-file.entity';
import { PoolFolder } from './pool/entity/pool-folder.entity';
import { PoolMember } from './pool/entity/pool-member.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: process.env.POSTGRES_SSLMODE
    ? {
        rejectUnauthorized: false,
      }
    : false,
  entities: [User, PoolMember, PoolFolder, PoolFile],
  migrationsTableName: 'migration',
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
