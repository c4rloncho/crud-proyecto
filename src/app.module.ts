import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProyectoModule } from './proyecto/proyecto.module';
import { HttpModule } from '@nestjs/axios';
import { Proyecto } from './proyecto/entities/proyecto.entity';

@Module({
  imports: [ProyectoModule,HttpModule,TypeOrmModule.forFeature([Proyecto])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
