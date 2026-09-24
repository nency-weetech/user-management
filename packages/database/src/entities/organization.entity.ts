import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('organizations')
export class Organizations{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({type: 'uuid'})
    owner_id!: string;

    @ManyToOne(()=> User, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'owner_id'})
    owner!: User;

    @Column({type: 'boolean', default: true})
    is_default!: Boolean;

    @CreateDateColumn({type: 'timestamp with time zone'})
    created_at!: Date;
}