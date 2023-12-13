import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipoController } from './controllers/equipo.controller';
import { EquipoService } from './services/equipo.service';
import { Equipo } from './entities/equipo.entity';
import { UsersModule } from '../users/users.module'; // Asegúrate de importar UsersModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipo]),
    UsersModule, // Agrega UsersModule a las importaciones
  ],
  controllers: [EquipoController],
  providers: [EquipoService],
  exports: [EquipoService],
})
export class EquipoModule {}