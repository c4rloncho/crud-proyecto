// ormconfig.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'admin',
    password: 'admin',
    database: 'bacesita1',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrations: ['dist/migration/*.js'], 
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
    logger: 'advanced-console'
};

export default config;