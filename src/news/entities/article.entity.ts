import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int',unique: true })
  externalId!: number;

  @Column({ type: 'varchar', nullable: true })
  summary!: string | null;

  @Column({type: 'varchar'})
  url!: string;

  @Column({type: 'varchar', nullable: true })
  image!: string | null;

  @Column({ type: 'varchar', nullable: true })
  author!: string | null;

  @Column({ type: 'varchar' , nullable: true })
  language!: string | null;

  @Column({ type: 'varchar', nullable: true })
  catagory!: string | null;

  @Column({type: 'varchar', nullable: true })
  sourceCountry!: string | null;

  @Column('decimal', { precision: 5, scale: 3, nullable: true })
  sentiment!: number | null;

  @Column({ type: 'timestamptz' })
  publishDated!: Date | null;

  @Column({ type: 'timestamptz' })
  lastRefreshedAt!: Date;

}