import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateInflowDto } from './dto/inflow.dto';
import { CreateOutflowDto } from './dto/outflow.dto';
import { CreateTransferDto } from './dto/transfer.dto';
import { LedgerQueryDto } from './dto/ledger-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsVerifiedGuard } from '../auth/guards/is-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, IsVerifiedGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // GET /transactions — paginated ledger
  @Get()
  getLedger(@Query() query: LedgerQueryDto, @CurrentUser() user: User) {
    return this.transactionsService.getLedger(user.id, query);
  }

  // GET /transactions/export — CSV download
  @Get('export')
  async exportCsv(
    @Query() query: LedgerQueryDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const csv = await this.transactionsService.exportCsv(user.id, query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="flowledger-export-${Date.now()}.csv"`,
    );
    res.send(csv);
  }

  // GET /transactions/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.transactionsService.findOne(id, user.id);
  }

  // POST /transactions/inflow
  @Post('inflow')
  @HttpCode(HttpStatus.CREATED)
  createInflow(@Body() dto: CreateInflowDto, @CurrentUser() user: User) {
    return this.transactionsService.createInflow(user.id, dto);
  }

  // POST /transactions/outflow
  @Post('outflow')
  @HttpCode(HttpStatus.CREATED)
  createOutflow(@Body() dto: CreateOutflowDto, @CurrentUser() user: User) {
    return this.transactionsService.createOutflow(user.id, dto);
  }

  // POST /transactions/transfer
  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  createTransfer(@Body() dto: CreateTransferDto, @CurrentUser() user: User) {
    return this.transactionsService.createTransfer(user.id, dto);
  }
}
