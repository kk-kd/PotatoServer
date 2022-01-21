import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
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

  @Column("decimal")
  longitude: number;

  @Column("decimal")
  latitude: number;

  @Column()
  isAdmin: boolean;
}
[];
