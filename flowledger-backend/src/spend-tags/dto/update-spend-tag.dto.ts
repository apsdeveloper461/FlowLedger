import { PartialType } from '@nestjs/mapped-types';
import { CreateSpendTagDto } from './create-spend-tag.dto';

export class UpdateSpendTagDto extends PartialType(CreateSpendTagDto) {}
