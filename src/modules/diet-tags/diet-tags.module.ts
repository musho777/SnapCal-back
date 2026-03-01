import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietTagsController } from './diet-tags.controller';
import { DietTagsService } from './diet-tags.service';
import { DietTag } from './entities/diet-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DietTag])],
  controllers: [DietTagsController],
  providers: [DietTagsService],
  exports: [DietTagsService],
})
export class DietTagsModule {}
