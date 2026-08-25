import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Community } from '../../communities/entities/community.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, { nullable: true })
  @JoinColumn({ name: 'community_id' })
  community?: Community;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'target_participants', default: 0 })
  targetParticipants: number;

  @Column({ name: 'current_participants', default: 0 })
  currentParticipants: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
