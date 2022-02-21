import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from "typeorm";
import { Route } from "./Route";
import { Student } from "./Student";

@Entity({ name: "stops" })
export class Stop {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  location: string;

  @Column("decimal")
  longitude: number;

  @Column("decimal")
  latitude: number;

  @Column({ type: "time" })
  pickupTime: string;

  @Column({ type: "time" })
  dropoffTime: string;

  @Column({ type: "decimal", nullable: true })
  arrivalIndex: number;

  @ManyToOne(() => Route, (route) => route.stops, { onDelete: "CASCADE", orphanedRowAction: "delete" })
  route: Route;

  @ManyToMany(() => Student, student => student.inRangeStops, { nullable: true })
  inRangeStudents: Student[];
}
