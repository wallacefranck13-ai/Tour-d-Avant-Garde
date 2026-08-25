import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('world_prayer_intentions')
export class WorldPrayerIntention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column()
  title: string;

  @Column({ type: 'simple-json' })
  items: string[];
}
