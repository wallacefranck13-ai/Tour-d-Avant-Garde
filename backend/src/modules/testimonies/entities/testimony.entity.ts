import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('testimonies')
export class Testimony {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'author_name' })
  authorName: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ name: 'photo_path', nullable: true })
  photoPath?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
