import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { BookMarks } from "./bookmark.entity";

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: false })
    is_default!: boolean;

    @OneToMany(() => BookMarks, (bookMark)=> bookMark.profile)
    bookmarks!: BookMarks[];

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}