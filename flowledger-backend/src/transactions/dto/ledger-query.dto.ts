import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsString,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../enums/transaction-type.enum';

export class LedgerQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsUUID()
  walletId?: string;

  @IsOptional()
  @IsUUID()
  spendTagId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string; // ILIKE on note

  @IsOptional()
  @IsIn(['date', 'amount'])
  sortBy?: 'date' | 'amount';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
