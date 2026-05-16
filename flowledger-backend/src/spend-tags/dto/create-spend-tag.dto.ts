import { IsString, IsHexColor, MaxLength } from 'class-validator';

export class CreateSpendTagDto {
  @IsString()
  @MaxLength(60)
  name: string;

  @IsHexColor()
  color: string;
}
