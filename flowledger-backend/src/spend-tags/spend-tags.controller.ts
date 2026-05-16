import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SpendTagsService } from './spend-tags.service';
import { CreateSpendTagDto } from './dto/create-spend-tag.dto';
import { UpdateSpendTagDto } from './dto/update-spend-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsVerifiedGuard } from '../auth/guards/is-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, IsVerifiedGuard)
@Controller('spend-tags')
export class SpendTagsController {
  constructor(private readonly spendTagsService: SpendTagsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.spendTagsService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.spendTagsService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateSpendTagDto, @CurrentUser() user: User) {
    return this.spendTagsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpendTagDto,
    @CurrentUser() user: User,
  ) {
    return this.spendTagsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.spendTagsService.delete(id, user.id);
  }
}
