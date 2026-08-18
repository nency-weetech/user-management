import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('UserUsage')
export class UserUsage{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable: true, unique: true})
    userId!: string|null;

    @ManyToMany(()=> User, {nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({name: 'userId'})
    user: User|null;

    @Column({type: 'int', default: 0})
    dailyArticleViewCount!: Number;

    @Column({nullable: true})
    dailyArticleViewResetAt!: Date;

    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamp with time zone'})
    updatedAt!: Date;
}