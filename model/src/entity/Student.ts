import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Route } from "./Route";
import { School } from "./School";
import { User } from "./User";
import { Stop } from "./Stop";

@Entity({ name: "students" })
export class Student {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({
    nullable: true,
  })
  id: string;

  @Column()
  fullName: string;

  @ManyToOne(() => School, (school) => school.students, { onDelete: "CASCADE" })
  school: School;

  @ManyToOne(() => Route, (route) => route.students, {
    onDelete: "SET NULL",
    nullable: true,
  })
  route: Route;

  @ManyToOne(() => User, (user) => user.students, { onDelete: "CASCADE" })
  parentUser: User;

  @ManyToMany(() => Stop, (stop) => stop.inRangeStudents, { cascade: true })
  @JoinTable()
  inRangeStops: Stop[];

  @OneToOne(() => User, (user) => user.studentInfo, { cascade: true, onDelete: "SET NULL", nullable: true })
  @JoinColumn()
  account: User;
}
