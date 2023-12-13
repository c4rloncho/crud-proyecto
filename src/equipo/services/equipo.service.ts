// equipo.service.ts
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from '../entities/equipo.entity';
import { CreateEquipoDto } from '../dto/create-equipo.dto';
import { UpdateEquipoDto } from '../dto/update-equipo.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EquipoService {
  constructor(
    @InjectRepository(Equipo)
    private equipoRepository: Repository<Equipo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Equipo[]> {
    return this.equipoRepository.find();
  }

  async createEquipo(createEquipoDto: CreateEquipoDto): Promise<Equipo> {
    const nuevoEquipo = this.equipoRepository.create(createEquipoDto);
    return await this.equipoRepository.save(nuevoEquipo);
  }
  async findOneByName(nombre: string): Promise<Equipo> {
    return this.equipoRepository.findOne({ where: { nombre } });
  }
  async findOneById(id: number): Promise<Equipo> {
    return this.equipoRepository.findOne({ where: { id } });
  }
  async updateEquipo(nombre: string, updateEquipoDto: UpdateEquipoDto): Promise<Equipo> {
    const equipo = await this.equipoRepository.findOne({ where: { nombre } });
    if (!equipo) {
      throw new NotFoundException(`Equipo con nombre "${nombre}" no encontrado`);
    }

    if (updateEquipoDto.nombre) {
      equipo.nombre = updateEquipoDto.nombre;
    }

    return this.equipoRepository.save(equipo);
  }
  async deleteEquipo(equipo: Equipo): Promise<void> {
    // Elimina el equipo
    await this.equipoRepository.remove(equipo);
  }


  async addUserToTeam(username: string, equipoNombre: string): Promise<void> {
    try {
      const equipo = await this.equipoRepository.findOne({ 
        where: { nombre: equipoNombre }, 
        relations: ['users'] 
      });
      
      if (!equipo) {
        throw new NotFoundException(`Equipo con nombre '${equipoNombre}' no encontrado.`);
      }

      // Buscando el usuario por su nombre de usuario
      const user = await this.userRepository.findOne({ where: { username: username } });
      
      if (!user) {
        throw new NotFoundException(`Usuario con nombre '${username}' no encontrado.`);
      }

      const isUserAlreadyInTeam = equipo.users.some(existingUser => existingUser.id === user.id);
      if (isUserAlreadyInTeam) {
        throw new BadRequestException(`El usuario '${username}' ya es miembro del equipo.`);
      }

      equipo.users.push(user);
      await this.equipoRepository.save(equipo);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('El usuario ya es miembro de este equipo.');
      } else {
        console.log(error); // Puede ser útil para depuración
        throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud.');
      }
    }
  }
  
  async findEquiposByUserId(userId: number): Promise<Equipo[]> {
    try {
      return await this.equipoRepository
        .createQueryBuilder('equipo') // 'equipo' es el alias para la entidad Equipo
        .innerJoinAndSelect('equipo.users', 'user', 'user.id = :userId', { userId })
        // Asegúrate de que 'equipo.users' sea el campo de la relación en la entidad Equipo
        .getMany();
    } catch (error) {
      throw new Error('No se pudieron obtener los equipos del usuario debido a un error en la base de datos.');
    }
  }
  async findUsersByEquipoId(equipoId: number): Promise<User[]> {
    const equipo = await this.equipoRepository
      .createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.users', 'user')
      .where('equipo.id = :equipoId', { equipoId })
      .getOne();

    if (!equipo) {
      throw new NotFoundException(`Equipo with ID ${equipoId} not found`);
    }

    return equipo.users;
  }
}

