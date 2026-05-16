import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsVerifiedGuard } from '../auth/guards/is-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, IsVerifiedGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  getStats(@Query() query: AnalyticsQueryDto, @CurrentUser() user: User) {
    return this.analyticsService.getDashboardStats(user.id, query);
  }

  @Get('daily-flow')
  getDailyFlow(@Query() query: AnalyticsQueryDto, @CurrentUser() user: User) {
    return this.analyticsService.getDailyFlow(user.id, query);
  }

  @Get('spend-tags')
  getSpendTagBreakdown(@Query() query: AnalyticsQueryDto, @CurrentUser() user: User) {
    return this.analyticsService.getSpendTagBreakdown(user.id, query);
  }

  @Get('wallet-balances')
  getWalletBalances(@CurrentUser() user: User) {
    return this.analyticsService.getWalletBalances(user.id);
  }

  @Get('monthly-net-flow')
  getMonthlyNetFlow(@CurrentUser() user: User) {
    return this.analyticsService.getMonthlyNetFlow(user.id);
  }

  @Get('top-spend-tags')
  getTopSpendTags(@Query() query: AnalyticsQueryDto, @CurrentUser() user: User) {
    return this.analyticsService.getTopSpendTags(user.id, query);
  }

  @Get('transfer-fees')
  getTransferFeeOverview(@CurrentUser() user: User) {
    return this.analyticsService.getTransferFeeOverview(user.id);
  }
}
