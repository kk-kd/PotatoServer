import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { School } from "./School";

@Entity()
export class Route {
  @PrimaryGeneratedColumn()
  rid: number;

  @Column()
  name: string;

  @Column()
  desciption: string;

  @JoinColumn()
  @OneToOne((type) => School)
  school: School;
}
