import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum WhatsAppState {
  MENU = 'MENU',
  AWAITING_PRAYER_REQUEST = 'AWAITING_PRAYER_REQUEST',
  AWAITING_TESTIMONY = 'AWAITING_TESTIMONY',
  AWAITING_RESPONSABLE_MESSAGE = 'AWAITING_RESPONSABLE_MESSAGE',
}

@Entity('whatsapp_sessions')
export class WhatsAppSession {
  @PrimaryColumn()
  phone: string;

  @Column({ type: 'varchar', default: WhatsAppState.MENU })
  state: WhatsAppState;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
