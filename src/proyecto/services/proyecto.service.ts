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
      fechaCreacion: new Date(),
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
    const response = await firstValueFrom(this.httpService.post(`http://localhost:3000/equipos/agregar-proyecto`,{
      proyectoId:proyectoId, equipoId:equipoId 
    }));
  
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
    const equiposInfo: number[] = [];
    for (const equipoId of equipoIds) {
      try {
        const existeEquipo = await this.VerificarEquipo(equipoId,proyectoId);
        if(existeEquipo){
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

  async eliminarProyecto(idProyecto: number): Promise <void> {
    try{
      const proyecto = await this.proyectoRepository.findOne({where :{id: idProyecto}});
      if(!proyecto){
        throw new HttpException('proyecto no encontrado',HttpStatus.INTERNAL_SERVER_ERROR)
      }
      await this.desasociarProyectoDeEquipos(proyecto)
      await this.proyectoRepository.delete(idProyecto);
    }
    catch(error){
      throw new HttpException('no se puede eliminar proyecto',HttpStatus.INTERNAL_SERVER_ERROR)
    }

  }
  private async desasociarProyectoDeEquipos(proyecto: Proyecto): Promise<void> {
    try {
      // Desasociar el proyecto de cada equipo
      for (const equipoId of proyecto.equipos) {
        const response = await firstValueFrom(
          this.httpService.post(
            `http://localhost:3000/equipos/desasociar-proyecto`,
            { proyectoId: proyecto.id, equipoId: equipoId }, // equipo solo es una id 
          ),
        );
        if (response.status !== 200) {
          // Manejar el caso en el que la desasociación no fue exitosa
          throw new HttpException('Error al desasociar el proyecto del equipo', HttpStatus.INTERNAL_SERVER_ERROR);
        }

      }
    } 
    catch (error) {
      throw new HttpException('Error al desasociar el proyecto de los equipos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async DesasociarEquipo(proyectoId: number, equipoId: number): Promise<void> {
    try{
      const proyecto = await this.proyectoRepository.findOne({where:{id: proyectoId}});
      if(!proyecto){
        throw new HttpException('proyecto no encontrado',HttpStatus.
        NOT_FOUND);
      }
      proyecto.equipos = proyecto.equipos.filter((id) => id!== equipoId);
      await this.proyectoRepository.save(proyecto);
    }
    catch(error){
      throw new HttpException('Error al desasociar ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async editarProyecto(idProyecto: number, updateProyectoDto: UpdateProyectoDto): Promise<void> {
    try {
      
      const proyecto = await this.proyectoRepository.findOne({ where: { id: idProyecto } });

      // Verificar si el proyecto existe
      if (!proyecto) {
        throw new HttpException(`Proyecto with ID ${idProyecto} not found`, HttpStatus.NOT_FOUND);
      }

      // Actualizar la descripción y el nombre si se proporcionan en el DTO
      if (updateProyectoDto.descripcion) {
        proyecto.descripcion = updateProyectoDto.descripcion;
      }

      if (updateProyectoDto.nombre) {
        proyecto.nombre = updateProyectoDto.nombre;
      }

      // Guardar el proyecto actualizado en la base de datos
      await this.proyectoRepository.save(proyecto);
    } catch (error) {
      throw new HttpException('Error al editar el proyecto', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

