import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionOfFaith } from './entities/action-of-faith.entity';
import { ActionOfFaithService } from './action-of-faith.service';
import { ActionOfFaithController } from './action-of-faith.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActionOfFaith])],
  controllers: [ActionOfFaithController],
  providers: [ActionOfFaithService],
  exports: [ActionOfFaithService, TypeOrmModule],
})
export class ActionOfFaithModule {}
