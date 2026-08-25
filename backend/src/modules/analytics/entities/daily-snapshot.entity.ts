import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('daily_snapshots')
export class DailySnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column({ default: 0 })
  participants: number;

  @Column({ name: 'demandes_recues', default: 0 })
  demandesRecues: number;

  @Column({ default: 0 })
  urgentes: number;

  @Column({ name: 'intercesseurs_connectes', default: 0 })
  intercesseursConnectes: number;

  @Column({ name: 'total_prayer_requests', default: 0 })
  totalPrayerRequests: number;

  @Column({ name: 'total_testimonies', default: 0 })
  totalTestimonies: number;

  @Column({ name: 'total_intercessors', default: 0 })
  totalIntercessors: number;

  @Column({ name: 'total_prayer_hours', default: 0 })
  totalPrayerHours: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
