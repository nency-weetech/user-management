import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "./role.entity";
import { Permissions } from "./permission.entity";

@Entity('role_permissions')
export class RolePermissions {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    role_id!: string;

    @ManyToOne(() => Roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role!: Roles;

    @Column({ type: 'uuid' })
    permission_id!: string;

    @ManyToOne(() => Permissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permission_id' })
    permission!: Permissions;
}