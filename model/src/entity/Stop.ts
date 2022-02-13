import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Route } from "./Route";

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
}
