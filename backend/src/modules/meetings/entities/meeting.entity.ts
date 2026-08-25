import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Community } from '../../communities/entities/community.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, { nullable: true })
  @JoinColumn({ name: 'community_id' })
  community?: Community;

  @Column()
  title: string;

  @Column({ default: 'prayer' })
  type: string;

  @Column({ name: 'start_at', type: 'datetime' })
  startAt: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'reminder_sent', default: false })
  reminderSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
