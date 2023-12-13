import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TareaService } from '../services/tarea.service';
import { Tarea } from '../entities/tarea.entity';
import { CrearProyectoDto } from 'src/proyecto/dto/create-proyecto.dto';
import { request } from 'http';
import { User } from 'src/users/entities/user.entity';
import { CreateTareaDto } from '../dto/create-tarea.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FiltrarTareaDto } from '../dto/filtrar-tarea.dto';

@Controller('tarea')
export class TareaController {
    constructor(
        private tareaService: TareaService,
    ) { }

    @Get(':id')
    async BuscarPorId(@Param('id') id:number){
      const tarea = await this.tareaService.findOneById(id);
      if (!tarea) {
        throw new NotFoundException('tarea no encontrada');
        }
      return tarea;
    }

    @Post(':id/Add-Responsable/:responsableId')
    @UseGuards(AuthGuard)
    async agregarResponsable(@Param('id') id: number, @Param('responsableId') responsableId: number,@Req() request: any,) {
      try {
        const user = request.user.id;
        const tarea = await this.tareaService.agregarResponable(id, responsableId,user);
        return {
          message: 'Responsable asignado con éxito',
          tarea,
        };
      } catch (error) {
        throw this.handleError(error);
      }
    }
    @Get()
    async getAll(){
      try {
        const tareas = await this.tareaService.obtenerTodasLasTareas();
        return tareas || [];
      } catch (error) {
        throw this.handleError(error);
      }
    }

    @Get('custom')
    async getTareas(@Body()filtro: FiltrarTareaDto) {
      try {
        const tareas = await this.tareaService.getTareas(filtro);
        return {
          message: 'Tareas obtenidas con éxito',
          tareas,
        };
      } catch (error) {
        throw this.handleError(error);
      }
    }
    
    @Post('create')
    @UseGuards(AuthGuard)
    async createTarea(
      @Body() createTareaDto: CreateTareaDto,
      @Req() request: any,
    ) {
      // request.user ahora debería contener el payload del token JWT verificado
      const creadorId = request.user.id;
  
      try { 
        const tarea = await this.tareaService.createTarea(createTareaDto, creadorId);
        
        return {
          message: 'Tarea creada con éxito',
          tarea,
        };
      } catch (error) {
        // Manejo de errores
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Error al crear la tarea',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteTarea(@Param('id') id: number) {
      try {
        await this.tareaService.eliminarTarea(id);
        return {
          message: 'Tarea eliminada con éxito',
        };
      } catch (error) {
        throw this.handleError(error);
      }
    }

    private handleError(error: any) {
      if (error instanceof HttpException) {
        return error;
      } else {
        return new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Error en la operación de tarea',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
}
