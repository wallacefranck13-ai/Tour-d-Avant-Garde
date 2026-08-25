import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorldPrayerIntention } from './entities/world-prayer-intention.entity';
import { WorldIntentionsService } from './world-intentions.service';
import { WorldIntentionsController } from './world-intentions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorldPrayerIntention])],
  controllers: [WorldIntentionsController],
  providers: [WorldIntentionsService],
  exports: [WorldIntentionsService, TypeOrmModule],
})
export class WorldIntentionsModule {}
