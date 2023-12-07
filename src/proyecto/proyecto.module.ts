import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { ProyectoController } from './controllers/proyecto.controller';
import { ProyectoService } from './services/proyecto.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService],
  exports: [ProyectoService],
})
export class ProyectoModule {}