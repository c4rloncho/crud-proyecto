import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { Tarea } from '../entities/tarea.entity';
import { CreateTareaDto } from '../dto/create-tarea.dto';
import { UpdateTareaDto } from '../dto/update-tarea.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { FiltrarTareaDto } from '../dto/filtrar-tarea.dto';

@Injectable()
export class TareaService {
  constructor(
    @InjectRepository(Tarea)
    private tareaRepository: Repository<Tarea>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
  async findOneById(id:number){
    const tarea = this.tareaRepository.findOne({ where: {id}})
    return tarea;
  }
  async createTarea(tareaData: CreateTareaDto, creadorId: number): Promise<Tarea>{
    const tarea = this.tareaRepository.create(tareaData);
    tarea.creador = creadorId;
    return await this.tareaRepository.save(tarea);
  }

  async obtenerTodasLasTareas(): Promise<Tarea[]> {
    return await this.tareaRepository.find();
  }

  async getTareas(filtro:FiltrarTareaDto): Promise<Tarea[]> {
    const options: FindManyOptions<Tarea> = {};

    if (filtro.nombre) {
      options.where = { nombre: Like(`%${filtro.nombre}%`) };
    }
    if (filtro.responsable) {
      options.where = { ...options.where, responsable: filtro.responsable };
    }
  

    if (filtro.estado) {
      options.where = { ...options.where, estado: Like(`%${filtro.estado}%`) };
    }

    return await this.tareaRepository.find(options);
  }

  async updateTarea(id: number, updateTarea: UpdateTareaDto): Promise<Tarea> {
    const tarea = await this.tareaRepository.findOne({where:{id}});
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    this.tareaRepository.merge(tarea, updateTarea);
    return await this.tareaRepository.save(tarea);
  }
  async agregarResponable(id:number, responsableId:number, userid:number) {
    const tarea = await this.tareaRepository.findOne({where:{id}});
    if(!tarea){
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    else{
      const responsable = await this.userRepository.findOne({where:{id}});

      if (!responsable) {
        throw new NotFoundException(`Usuario responsable con ID ${responsableId} no encontrado`);
      }
      tarea.responsable = responsableId;
    }
    return await this.tareaRepository.save(tarea);
  }
  async eliminarTarea(id: number): Promise<void> {
    const tarea = await this.tareaRepository.findOne({where:{id}});

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    tarea.estado = 'eliminada'; //no hay que elimnar la tarea solo cambiar el estado
    // Guardar la tarea actualizada en la base de datos
    await this.tareaRepository.save(tarea);
  }
}
