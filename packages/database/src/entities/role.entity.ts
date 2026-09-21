import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Organizations } from "./organization.entity";

@Entity('roles')
export class Roles{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: 'uuid'})
    organization_id!: string;

    @ManyToOne(() => Organizations, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'organization_id'})
    organization!: Organizations;

    @Column()
    name!: string;

    @Column({type: 'boolean', default: false})
    is_default!: boolean;

    @CreateDateColumn({type: 'timestamp with time zone'})
    created_at!: Date;

}
