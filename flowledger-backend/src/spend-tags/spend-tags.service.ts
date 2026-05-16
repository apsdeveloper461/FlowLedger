import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpendTag } from './entities/spend-tag.entity';
import { CreateSpendTagDto } from './dto/create-spend-tag.dto';
import { UpdateSpendTagDto } from './dto/update-spend-tag.dto';

@Injectable()
export class SpendTagsService {
  constructor(
    @InjectRepository(SpendTag)
    private readonly spendTagsRepo: Repository<SpendTag>,
  ) {}

  async findAllByUser(userId: string): Promise<SpendTag[]> {
    return this.spendTagsRepo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<SpendTag> {
    const tag = await this.spendTagsRepo.findOneBy({ id, userId });
    if (!tag) throw new NotFoundException('Spend tag not found.');
    return tag;
  }

  async create(userId: string, dto: CreateSpendTagDto): Promise<SpendTag> {
    const tag = this.spendTagsRepo.create({ userId, ...dto });
    return this.spendTagsRepo.save(tag);
  }

  async update(id: string, userId: string, dto: UpdateSpendTagDto): Promise<SpendTag> {
    const tag = await this.findOne(id, userId);
    Object.assign(tag, dto);
    return this.spendTagsRepo.save(tag);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const tag = await this.findOne(id, userId);

    const txCount = await this.spendTagsRepo.manager.count('transactions', {
      where: { spendTagId: id },
    });

    if (txCount > 0) {
      throw new BadRequestException(
        'Cannot delete a spend tag that is referenced by transactions.',
      );
    }

    await this.spendTagsRepo.remove(tag);
    return { message: 'Spend tag deleted.' };
  }
}
