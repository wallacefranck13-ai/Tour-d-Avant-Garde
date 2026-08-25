import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Community } from '../../communities/entities/community.entity';
import { User } from '../../users/entities/user.entity';

@Entity('intercession_teams')
export class IntercessionTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Community, { nullable: true })
  @JoinColumn({ name: 'community_id' })
  community?: Community;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'leader_id' })
  leader?: User;
}
