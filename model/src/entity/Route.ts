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
import { Run } from "./Run";
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

  @Column("text", {
    array: true
  })
  polyline: string[];

  @OneToMany(() => Student, (student) => student.route, {
    cascade: true
  })
  students: Student[];

  @ManyToOne(() => School, (school) => school.routes, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete"
  })
  school: School;

  @OneToMany(() => Stop, (stop) => stop.route, {
    cascade: true,
    eager: true,
  })
  stops: Stop[];

  @OneToMany(() => Run, (run) => run.route, {
    cascade: true,
    eager: true,
  })
  runs: Run[];

  studentCount: number;
}
