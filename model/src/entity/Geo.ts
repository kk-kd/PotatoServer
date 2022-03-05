import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity({ name: "geo" })
@Unique(["address"])
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  address: string;

  @Column({
    type: "decimal",
  })
  longitude: number;

  @Column({
    type: "decimal",
  })
  latitude: number;

  @Column({ type: "time" })
  timeCreated: string;
}
