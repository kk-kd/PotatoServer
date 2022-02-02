import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Route } from "./Route";
import { School } from "./School";
import { User } from "./User";

@Entity({ name: "students" })
export class Student {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({
    nullable: true,
  })
  id: string;

  @Column()
  firstName: string;

  @Column({
    nullable: true,
  })
  middleName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => School, school => school.students, { onDelete: "CASCADE" })
  school: School;

  @ManyToOne(() => Route, route => route.students, { onDelete: "SET NULL", nullable: true, })
  route: Route;

  @ManyToOne(() => User, user => user.students, { onDelete: 'CASCADE' })
  parentUser: User;
}
