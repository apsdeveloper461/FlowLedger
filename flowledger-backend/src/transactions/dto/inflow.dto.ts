import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
  IsUUID,
  MaxLength,
  Max,
} from 'class-validator';

export class CreateInflowDto {
  @IsUUID()
  walletId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sourceLabel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;

  @IsDateString()
  date: string;
}
