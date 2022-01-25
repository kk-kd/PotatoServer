import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { School } from "./School";
import { Student } from "./Student";

@Entity({ name: "routes" })
export class Route {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  name: string;

  @Column()
  desciption: string;
  
  @OneToMany(() => Student, student => student.route, {nullable: true,})
  students: Student[];

  @ManyToOne(() => School, school => school.routes, {nullable: true,})
  school: School;
}
