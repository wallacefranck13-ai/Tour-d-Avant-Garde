import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';
import { Community } from '../../communities/entities/community.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ name: 'password_hash', nullable: true, select: false })
  passwordHash?: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: true })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @ManyToOne(() => Community, (community) => community.members, { nullable: true })
  @JoinColumn({ name: 'community_id' })
  community?: Community;

  @Column({ name: 'is_intercessor', default: false })
  isIntercessor: boolean;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_seen_at', type: 'datetime', nullable: true })
  lastSeenAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
