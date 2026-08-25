import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Community } from '../../communities/entities/community.entity';
import { PrayerStep } from './prayer-step.entity';

@Entity('prayer_programs')
export class PrayerProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, { nullable: true })
  @JoinColumn({ name: 'community_id' })
  community?: Community;

  @Column()
  title: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => PrayerStep, (step) => step.program, { cascade: true })
  steps: PrayerStep[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
