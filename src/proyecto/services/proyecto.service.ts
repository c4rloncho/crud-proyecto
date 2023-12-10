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
    const proyecto = this.proyectoRepository.findOne({ where: { nombre } }); 
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
  async findAllByIds(ids: number[]): Promise<Proyecto[]> {
    const proyectos = await this.proyectoRepository
      .createQueryBuilder('proyecto')
      .where('proyecto.id IN (:...ids)', { ids })
      .getMany();

    return proyectos;
  }

  async crearProyecto(createProyecto: CrearProyectoDto) {
    const newproyecto = await this.proyectoRepository.create({
      nombre: createProyecto.nombre,
      descripcion: createProyecto.descripcion,
    });
  
    const equiposInfo = await this.AsociarEquipos(createProyecto.equipoIds, newproyecto.id);
    newproyecto.equipos = equiposInfo;
  
    try {
      // Verificar la existencia de los equipos antes de crear el proyecto
      await this.proyectoRepository.save(newproyecto);
      return newproyecto;
    } catch (error) {
      throw new HttpException('Error al guardar el proyecto', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async VerificarEquipo(equipoId:number,proyectoId:number): Promise<boolean>{
    try{
    const response = await firstValueFrom(this.httpService.get(`http://localhost:3000/equipos/proyecto/${proyectoId}/equipo/${equipoId}`));
    if (response.status !== 200) {
      throw new HttpException(`Error al verificar el equipo con ID ${equipoId}. Respuesta del servicio: ${response.statusText}`, HttpStatus.BAD_REQUEST);
    }
  
      const equipoInfo = response.data;
      if(equipoInfo){
        return true;
      }
      else {
        throw new HttpException(`Equipo with ID ${equipoId} no existe...`, HttpStatus.BAD_REQUEST);
      }
    }
    catch(error){
      throw new HttpException(`Error al verificar el equipo con ID ${equipoId}`, HttpStatus.INTERNAL_SERVER_ERROR);
     } 

  }

  private async AsociarEquipos(equipoIds: number[],proyectoId:number): Promise<number[]> {
    const equiposInfo: any[] = [];
    for (const equipoId of equipoIds) {
      try {
        const equipoInfo = await this.VerificarEquipo(equipoId,proyectoId);
        if(equipoInfo){
          equiposInfo.push(equipoId);
        }
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
  

  async AgregarEquipoProyecto(proyectoId: number, equipoId: number): Promise<Proyecto | null> {
    try{
      const proyecto = await this.proyectoRepository.findOne({where:{id: proyectoId}});
      if(this.VerificarEquipo(equipoId,proyectoId)){ //se asocia automaticamente el proyecto al equipo si es que existe el equipo
        proyecto.equipos = [...proyecto.equipos,equipoId];
        await this.proyectoRepository.save(proyecto);
        return proyecto
      }
      else{
        throw new HttpException('Equipo no encontrado', HttpStatus.BAD_REQUEST);
      }
  
    }     
    catch(error){
      throw new HttpException(
        'error al asociar el equipo', HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

