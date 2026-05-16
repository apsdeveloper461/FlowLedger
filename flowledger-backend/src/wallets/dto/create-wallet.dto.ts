import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsHexColor,
  Min,
  MaxLength,
} from 'class-validator';
import { WalletType } from '../enums/wallet-type.enum';

export class CreateWalletDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(WalletType)
  type: WalletType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  initialBalance?: number;

  @IsHexColor()
  color: string;
}
