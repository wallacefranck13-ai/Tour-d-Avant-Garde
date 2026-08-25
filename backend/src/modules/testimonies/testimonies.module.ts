import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimony } from './entities/testimony.entity';
import { TestimoniesService } from './testimonies.service';
import { TestimoniesController } from './testimonies.controller';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Testimony]), AuthModule, StorageModule],
  controllers: [TestimoniesController],
  providers: [TestimoniesService],
  exports: [TestimoniesService, TypeOrmModule],
})
export class TestimoniesModule {}
