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
}
