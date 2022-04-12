import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
  OneToOne,
  ManyToMany,
} from "typeorm";
import { Run } from "./Run";
import { School } from "./School";
import { Student } from "./Student";

@Entity({ name: "users" })
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    type: "decimal",
    nullable: true,
  })
  longitude: number;

  @Column({
    type: "decimal",
    nullable: true,
  })
  latitude: number;

  @Column()
  role: string;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => Student, (student) => student.parentUser, {
    cascade: true,
    eager: true,
  })
  students: Student[];

  @ManyToMany(() => School, (school) => school.staff)
  attachedSchools: School[];

  @Column({
    nullable: true,
  })
  confirmationCode: string;

  @Column({
    nullable: true,
  })
  phoneNumber: string;

  @OneToMany(() => Run, (run) => run.driver, {
    cascade: true,
    eager: true
  })
  runs: Run[];

  @OneToOne(() => Student, (student) => student.account, { nullable: true, onDelete: "CASCADE" })
  studentInfo: Student;
}
