import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign]), AuthModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService, TypeOrmModule],
})
export class CampaignsModule {}
