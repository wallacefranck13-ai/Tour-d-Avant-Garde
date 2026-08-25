import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Community]), AuthModule],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService, TypeOrmModule],
})
export class CommunitiesModule {}
