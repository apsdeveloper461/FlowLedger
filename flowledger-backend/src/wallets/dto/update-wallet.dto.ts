import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateWalletDto } from './create-wallet.dto';

export class UpdateWalletDto extends PartialType(CreateWalletDto) {
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
