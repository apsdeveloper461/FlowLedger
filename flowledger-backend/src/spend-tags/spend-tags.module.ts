import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendTag } from './entities/spend-tag.entity';
import { SpendTagsService } from './spend-tags.service';
import { SpendTagsController } from './spend-tags.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SpendTag])],
  controllers: [SpendTagsController],
  providers: [SpendTagsService],
  exports: [SpendTagsService],
})
export class SpendTagsModule {}
