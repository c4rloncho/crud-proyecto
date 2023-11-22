import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ProyectoService } from '../services/proyecto.service';
import { CrearProyectoDto } from '../dto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';

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

}
