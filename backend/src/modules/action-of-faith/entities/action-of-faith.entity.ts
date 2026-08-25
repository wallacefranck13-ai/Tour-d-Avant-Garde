import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('action_of_faith')
export class ActionOfFaith {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'author_name' })
  authorName: string;

  @Column()
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
