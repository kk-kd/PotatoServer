import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  AfterUpdate,
} from "typeorm";
import { Route } from "./Route";
import { User } from "./User";
import { Stop } from "./Stop";

@Entity({ name: "runs" })
export class Run {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  busNumber: string;

  @ManyToOne(() => User, (user) => user.runs, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  driver: User;

  @ManyToOne(() => Route, (route) => route.runs, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  route: Route;

  @Column({ type: "timestamptz" })
  timeStarted: string;

  @Column({ type: "int", nullable: true })
  duration: number;

  @Column({ type: "boolean", nullable: true })
  timedOut: boolean;

  @Column({ type: "boolean" })
  ongoing: boolean;

  @Column()
  direction: string;

  @Column({ type: "timestamptz", nullable: true })
  lastFetchTime: string;

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

  @Column({
    nullable: true,
  })
  TTErroro: boolean;
}
