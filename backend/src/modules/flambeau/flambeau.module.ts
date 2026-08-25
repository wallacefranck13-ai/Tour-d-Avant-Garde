import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlambeauAssignment } from './entities/flambeau-assignment.entity';
import { FlambeauService } from './flambeau.service';
import { FlambeauController } from './flambeau.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlambeauAssignment]), AuthModule],
  controllers: [FlambeauController],
  providers: [FlambeauService],
  exports: [FlambeauService, TypeOrmModule],
})
export class FlambeauModule {}
