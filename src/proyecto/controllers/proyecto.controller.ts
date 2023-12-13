import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { ProyectoService } from '../services/proyecto.service';
import { CrearProyectoDto } from '../dto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';
import { Proyecto } from '../entities/proyecto.entity';

@Controller('proyecto')
export class ProyectoController {
    constructor(private readonly proyectoService: ProyectoService) { }

    @Get(':nombre')
    async findOneByNombre(@Param('nombre') nombre: string) {

        const proyecto = await this.proyectoService.findOneByNombre(nombre);
        if (!proyecto) {
            throw new NotFoundException('proyecto no encontrado')
        }
    }
    @Put(':id')
    async updateProyecto(@Param('id') id: number, @Body() updateProyectoDto: UpdateProyectoDto) {
        const proyecto = await this.proyectoService.updateProyecto(id, updateProyectoDto);
        return {
            message: 'Proyecto actualizado exitosamente',
            proyecto,
        };
    }
    @Post()
    async create(@Body() crearProyectoDto: CrearProyectoDto) {
      const proyecto =  this.proyectoService.crearProyecto(crearProyectoDto);
            return {
                message: 'Proyecto creado con exito', proyecto
            };
        }
        catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Error al crear el proyecto',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }




    /*
    @Delete(':id')
    async deleteProyecto(@Param('id') id: number) {
        await this.proyectoService.deleteProyecto(id);
        return {
            message: 'Proyecto eliminado exitosamente',
        };
    }
    @Post('create')
    async createProyecto(@Body() createProyecto: CrearProyectoDto) {
        try {


            const proyecto = await this.proyectoService.crearProyecto(createProyecto);
            return {
                message: 'Proyecto creado con exito', proyecto
            };
        }
        catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Error al crear el proyecto',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    @Get()
    async findAllByIds(@Query('ids') ids: string): Promise<any[]> {
        const proyectoIds = ids.split(',').map(id => +id); // Convertir la cadena de IDs a una matriz de números
        return await this.proyectoService.findAllByIds(proyectoIds);
    }

    @Post('agregar-equipo')
    async AgregarEquipoProyecto(@Body() body: { proyectoId: number; equipoId: number }) {

        try {
            const proyecto = await this.proyectoService.AgregarEquipoProyecto(body.proyectoId, body.equipoId);
            return {
                proyecto
            };
        }
        catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Error al agregar el equipo al proyecto',
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete(':id')
    async eliminarProyecto(@Param('id') idProyecto: number) {
      try {
        await this.proyectoService.eliminarProyecto(idProyecto);
        return {
          message: 'Proyecto eliminado con éxito',
        };
      } catch (error) {
        // Manejar errores, por ejemplo, si el proyecto no se pudo eliminar
        return {
          message: 'Error al eliminar el proyecto',
          error: error.message,
        };
      }
    }
    @Post('desasociar-equipo')
    async DesasociarEquipo(@Body() data:{proyectoId:number,equipoId:number}): Promise<void>{
        return this.proyectoService.DesasociarEquipo(data.proyectoId,data.equipoId);
    }
    @Put(':id/editar')
    async editarProyecto(@Param('id') idProyecto: number, @Body() updateProyectoDto: UpdateProyectoDto): Promise<void> {
      return this.proyectoService.editarProyecto(idProyecto, updateProyectoDto);
    }
    */
}
