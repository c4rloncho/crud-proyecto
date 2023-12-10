import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ProyectoModule } from './proyecto/proyecto.module';
import { HttpModule } from '@nestjs/axios';
import { Proyecto } from './proyecto/entities/proyecto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import config from './config/dataBaseConfig';
import { ProyectoService } from './proyecto/services/proyecto.service';

@Module({
  imports: [ProyectoModule, HttpModule, TypeOrmModule.forRoot(config),],
  controllers: [AppController],
  providers: [AppService,ProyectoService],
})
export class AppModule {}
