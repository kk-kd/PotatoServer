import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from "typeorm";
import { Student } from "./Student";
export enum UserStatus {
  ACTIVE = "active",
  PENDING = "pending",
}

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
  isAdmin: boolean;

  @Column()
  password: string;

  @OneToMany(() => Student, (student) => student.parentUser, {
    cascade: true,
    eager: true,
  })
  students: Student[];

  @Column({
    nullable: true,
  })
  confirmationCode: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;
}
