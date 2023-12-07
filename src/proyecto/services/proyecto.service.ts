import { Injectable, NotFoundException } from '@nestjs/common';
import { CrearProyectoDto } from '../dto/create-proyecto.dto';
import { Repository } from 'typeorm';
import { Proyecto } from '../entities/proyecto.entity';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProyectoService {

  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
  ) {}

  async findOneByNombre(nombre: string) {
    const proyecto = this.proyectoRepository.findOne({ where: { nombre } }); \
    return proyecto;
  }


  async crearProyecto(createProyecto: CrearProyectoDto) {


    const newproyecto = this.proyectoRepository.create(createProyecto)
    // Verificar la existencia de los equipos antes de crear el proyecto
    await this.verificarEquipos(createProyecto.equipoIds,newproyecto.id);
    return this.proyectoRepository.save(newproyecto)
  }

  async updateProyecto(id: number, updateProyectoDto: UpdateProyectoDto): Promise<Proyecto> {
    const proyecto = await this.proyectoRepository.findOne({ where: { id } });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    if (updateProyectoDto.nombre) {
      proyecto.nombre = updateProyectoDto.nombre;
    }

    if (updateProyectoDto.descripcion) {
      proyecto.descripcion = updateProyectoDto.descripcion;
    }

    return this.proyectoRepository.save(proyecto);
  }

  async deleteProyecto(id: number): Promise<void> {
    const proyecto = await this.proyectoRepository.findOne({ where: { id } });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    await this.proyectoRepository.remove(proyecto);
  }

  // En el servicio de proyectos
  async getProyectosPorIds(ids: string[]): Promise<Proyecto[]> {
    return this.proyectoModel.find({ _id: { $in: ids } }).exec();
}

private async verificarEquipos(equipoIds: number[],idProyecto:number): Promise<void> {
  for (const equipoId of equipoIds) {
    try {
      // Realizar solicitud GET al microservicio de equipo para verificar la existencia del equipo
      const response = await this.httpService.get(`URL_DEL_MICROSERVICIO_EQUIPO/info/${equipoId}`).toPromise();

      // Manejar la respuesta según tus necesidades
      const equipoInfo = response.data;

      // Realizar alguna lógica adicional si es necesario

    } catch (error) {
      // Manejar errores, por ejemplo, si el equipo no existe
      throw new HttpException(
        `Equipo with ID ${equipoId} not found`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
}

