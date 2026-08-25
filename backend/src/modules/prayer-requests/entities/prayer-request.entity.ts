import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IntercessionTeam } from '../../intercession-teams/entities/intercession-team.entity';

export enum PrayerRequestStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  ASSIGNED = 'ASSIGNED',
  ANSWERED = 'ANSWERED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('prayer_requests')
export class PrayerRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'author_name' })
  authorName: string;

  @Column()
  phone: string;

  @Column()
  subject: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'Autre' })
  category: string;

  @Column({ type: 'varchar', default: PrayerRequestStatus.NEW })
  status: PrayerRequestStatus;

  @Column({ name: 'is_urgent', default: false })
  isUrgent: boolean;

  @ManyToOne(() => IntercessionTeam, { nullable: true })
  @JoinColumn({ name: 'assigned_team_id' })
  assignedTeam?: IntercessionTeam;

  @Column({ default: 'whatsapp' })
  source: string;

  @Column({ name: 'follow_up_sent', default: false })
  followUpSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
