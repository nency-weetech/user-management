import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('permissions')
export class Permissions {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({unique: true})
    name!: string;
}