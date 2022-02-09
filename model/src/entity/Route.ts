import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
  AfterUpdate,
} from "typeorm";
import { School } from "./School";
import { Student } from "./Student";
import { Stop } from "./Stop";

@Entity({ name: "routes" })
export class Route {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  name: string;

  @Column()
  desciption: string;

  @OneToMany(() => Student, (student) => student.route, {
    cascade: true,
    nullable: true,
  })
  students: Student[];

  @ManyToOne(() => School, (school) => school.routes, { onDelete: "CASCADE" })
  school: School;

  @OneToMany(() => Stop, (stop) => stop.route, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  stops: Stop;

  studentCount: number;
}
