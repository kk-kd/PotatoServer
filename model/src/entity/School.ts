import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";

@Entity()
export class School {
  @PrimaryGeneratedColumn()
  schoolId: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column("decimal")
  longitude: number;

  @Column("decimal")
  latitude: number;
}
