import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ default: 'whatsapp' })
  channel: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  body?: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ name: 'sent_at', type: 'datetime', nullable: true })
  sentAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
