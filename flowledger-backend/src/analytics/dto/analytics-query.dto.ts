import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsUUID()
  walletId?: string;
}
