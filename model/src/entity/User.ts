import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
  ManyToMany,
} from "typeorm";
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
  firstName: string;

  @Column({
    nullable: true,
  })
  middleName: string;

  @Column()
  lastName: string;

  @Column()
  address: string;

  @Column({
    type: "decimal"
  })
  longitude: number;

  @Column({
    type: "decimal"
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

  @ManyToMany(() => School, school => school.staff)
  attachedSchools: School[];

  @Column({
    nullable: true,
  })
  confirmationCode: string;
}
