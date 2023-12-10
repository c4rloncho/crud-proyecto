
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';


@Entity()
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  // Añadir columna 'descripcion'
  @Column({ nullable: true, type: 'text' })
  descripcion: string;

  // Añadir columna 'fechaCreacion' que registra automáticamente la fecha de creación
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion: Date;
  
  @Column({ nullable: false, name: 'creador_id' }) // Nueva columna para almacenar el ID del creador
  creadorId: number;

  @Column('int', { array: true, default: [] }) // Usar un array para almacenar IDs de   equipo: number[]; // Lista de IDs de equipo asociados
  equipos: number[]; // Lista de IDs de equipo asociados

}