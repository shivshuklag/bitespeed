import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { customConfigService } from './custom_config.service';
import { registerAs } from '@nestjs/config';

const config = {
  type: 'postgres',
  host: customConfigService.getValue('DATABASE_HOST'),
  port: Number(customConfigService.getValue('DATABASE_PORT')),
  username: customConfigService.getValue('DATABASE_USERNAME'),
  password: customConfigService.getValue('DATABASE_PASSWORD'),
  database: customConfigService.getValue('DATABASE_NAME'),
  entities: [join(__dirname, '/../**/*.entity.{js,ts}')],
  migrations: [join(__dirname, '/../../migration/*{.ts,.js}')],
  ssl: {
    rejectUnauthorized: false,
  },
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('database', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
