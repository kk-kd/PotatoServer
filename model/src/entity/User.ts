import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  middleName: string;

  @Column()
  lastName: string;

  @Column()
  address: string;

  @Column()
  isAdmin: boolean;

  @Column()
  hasStudents: boolean;

  @Column()
  familyId: number;
}
