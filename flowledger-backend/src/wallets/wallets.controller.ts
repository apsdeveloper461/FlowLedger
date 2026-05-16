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
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsVerifiedGuard } from '../auth/guards/is-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, IsVerifiedGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.walletsService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.walletsService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateWalletDto, @CurrentUser() user: User) {
    return this.walletsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWalletDto,
    @CurrentUser() user: User,
  ) {
    return this.walletsService.update(id, user.id, dto);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.walletsService.archive(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.walletsService.delete(id, user.id);
  }
}
