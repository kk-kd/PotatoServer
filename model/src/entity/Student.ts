import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Route } from "./Route";
import { School } from "./School";
import { User } from "./User";

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  studentId: number;

  @Column("int")
  assignedId: number;

  @Column()
  firstName: string;

  @Column()
  middleName: string;

  @Column()
  lastName: string;

  @JoinColumn()
  @OneToOne((type) => School)
  school: School;

  @JoinColumn()
  @OneToOne((type) => Route)
  route: Route;

  @JoinColumn()
  @OneToOne((type) => User)
  parent: User;
}
