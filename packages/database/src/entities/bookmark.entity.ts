import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Profile } from "./profile.entity";
import { Article } from "./article.entity";
import { Organizations } from "./organization.entity";

@Entity('bookmarks')
@Unique(['profile_id', 'article_id'])
export class BookMarks{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: 'uuid'})
    profile_id: string;

    @ManyToOne(()=> Profile, (profile) => profile.bookmarks, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'profile_id'})
    profile: Profile;

    @Column({type: 'uuid'})
    article_id: string;

    @ManyToOne(() => Article, {onDelete: 'CASCADE'})
    @JoinColumn({name : 'article_id'})
    article: Article

    @Column({nullable: true})
    note? : string;

    @Column({type: 'uuid', nullable: true})
    organization_id? : string

    @ManyToOne(() => Organizations, {nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({name: 'organization_id'})
    organization?: Organizations;

    @CreateDateColumn({type: 'timestamp with time zone'})
    created_at!: Date;

    @UpdateDateColumn({type: 'timestamp with time zone'})
    updated_at!: Date;
}