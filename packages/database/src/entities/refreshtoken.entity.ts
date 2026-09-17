import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('refresh_token')
export class RefreshToken{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: 'uuid'})
    user_id!: string;

    @ManyToOne(()=> User, {onDelete: 'CASCADE'})
    @JoinColumn({name : 'user_id'})
    user!: User;

    @Column()
    @Index()
    token_hash!: string;

    @Column({nullable: true})
    device_info?: string;

    @Column({nullable: true})
    ip_address?: string;

    @Column({type: 'timestamp with time zone'})
    expires_at!: Date;

    @CreateDateColumn({type: 'timestamp with time zone'})
    created_at!: Date;

    @Column({type: 'timestamp with time zone', nullable: true})
    revoked_at?: Date;
}