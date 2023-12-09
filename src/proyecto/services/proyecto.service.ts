import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CrearProyectoDto } from '../dto/create-proyecto.dto';
import { IsNull, Repository } from 'typeorm';
import { Proyecto } from '../entities/proyecto.entity';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class ProyectoService {

  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
    private readonly httpService: HttpService,
  ) {}

  async findOneByNombre(nombre: string) {
    const proyecto = this.proyectoRepository.findOne({ where: { nombre } }); \
    return proyecto;
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

  async crearProyecto(createProyecto: CrearProyectoDto) {
    const equiposInfo = await this.verificarEquipos(createProyecto.equipoIds);

    const newproyecto = await this.proyectoRepository.create({
      nombre:createProyecto.nombre,
      descripcion:createProyecto.descripcion,
    });
    newproyecto.equipos = equiposInfo;
    // Verificar la existencia de los equipos antes de crear el proyecto
    return this.proyectoRepository.save(newproyecto)
  }

  private async verificarEquipos(equipoIds: number[]): Promise<number[]> {
    const equiposInfo: any[] = [];
    for (const equipoId of equipoIds) {
      try {
        // Realizar solicitud GET al microservicio de equipo para verificar la existencia del equipo
        const response = await firstValueFrom(this.httpService.get(`http://localhost:3000/equipos/${equipoId}`));

        // Manejar la respuesta según tus necesidades
        const equipoInfo = response.data;
        if(equipoInfo){
          equiposInfo.push(equipoId);
        }
        else {
          console.warn(`Equipo with ID ${equipoId} does not exist. Skipping...`);
        }
        // Realizar alguna lógica adicional si es necesario

      } catch (error) {
        // Manejar errores, por ejemplo, si el equipo no existe
        throw new HttpException(
          `Equipo with ID ${equipoId} not found`,
          HttpStatus.BAD_REQUEST
        );
      }
    }
    return equiposInfo;
  }
}

