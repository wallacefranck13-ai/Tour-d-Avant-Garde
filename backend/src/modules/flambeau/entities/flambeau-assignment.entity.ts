import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface FlambeauChecklist {
  programmeLance: boolean;
  intercesseursEncourages: boolean;
  situationsImportantesTraitees: boolean;
  messagePublie: boolean;
}

@Entity('flambeau_assignments')
export class FlambeauAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'guardian_id' })
  guardian: User;

  @Column({ type: 'simple-json' })
  checklist: FlambeauChecklist;

  @Column({ name: 'encouragement_message', nullable: true })
  encouragementMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
