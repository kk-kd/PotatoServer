import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  JoinTable,
  OneToMany,
  ManyToMany,
} from "typeorm";
import { Route } from "./Route";
import { Student } from "./Student";
import { User } from "./User";

@Entity({ name: "schools" })
export class School {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  name: string;

  @Column({ unique: true })
  uniqueName: string;

  @Column()
  address: string;

  @Column("decimal")
  longitude: number;

  @Column("decimal")
  latitude: number;

  @OneToMany(() => Student, (student) => student.school, {
    cascade: true,
    eager: true,
  })
  students: Student[];

  @OneToMany(() => Route, (route) => route.school, {
    cascade: true,
    eager: true,
  })
  routes: Route[];

  @ManyToMany(() => User, (user) => user.attachedSchools, {
    cascade: true,
  })
  @JoinTable()
  staff: User[];

  @Column({
    type: "time",
  })
  arrivalTime: string;

  @Column({
    type: "time",
  })
  departureTime: string;
}
