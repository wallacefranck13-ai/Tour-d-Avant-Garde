import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PrayerProgram } from './prayer-program.entity';

@Entity('prayer_steps')
export class PrayerStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PrayerProgram, (program) => program.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'program_id' })
  program: PrayerProgram;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column()
  title: string;

  @Column({ name: 'duration_minutes', default: 15 })
  durationMinutes: number;

  @Column({ nullable: true })
  description?: string;
}
