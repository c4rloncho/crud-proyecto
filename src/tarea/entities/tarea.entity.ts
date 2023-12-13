import { Proyecto } from "src/proyecto/entities/proyecto.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Tarea {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
  @Column()
  creador:number;

  @Column()
  descripcion: string;

  @Column({ default: null, nullable: true })
  responsable: number;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column({ default: null, nullable: true })
  fechaInicio: Date;

  @Column({ default: null, nullable: true })
  fechaTermino: Date;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.tareas)
  proyecto: Proyecto;

  /*@ManyToOne(() => User, (user) => user.tareas)
  creador: User; */

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}