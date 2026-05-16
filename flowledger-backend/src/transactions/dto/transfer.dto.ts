import {
  IsUUID,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

export class CreateTransferDto {
  @IsUUID()
  fromWalletId: string;

  @IsUUID()
  toWalletId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  amount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  fee?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;

  @IsDateString()
  date: string;
}
