import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ default: 'Africa/Kinshasa' })
  timezone: string;

  @OneToMany(() => User, (user) => user.community)
  members: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
