import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietTag } from './entities/diet-tag.entity';

@Injectable()
export class DietTagsService {
  constructor(
    @InjectRepository(DietTag)
    private dietTagRepository: Repository<DietTag>,
  ) {}

  async findAll() {
    return this.dietTagRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const dietTag = await this.dietTagRepository.findOne({
      where: { id, is_active: true },
    });

    if (!dietTag) {
      throw new NotFoundException('Diet tag not found');
    }

    return dietTag;
  }

  async create(name: string, description?: string) {
    const existing = await this.dietTagRepository.findOne({
      where: { name },
    });

    if (existing) {
      throw new ConflictException('Diet tag with this name already exists');
    }

    const dietTag = this.dietTagRepository.create({
      name,
      description,
    });

    return this.dietTagRepository.save(dietTag);
  }

  async update(id: string, name?: string, description?: string) {
    const dietTag = await this.findOne(id);

    if (name) {
      dietTag.name = name;
    }

    if (description !== undefined) {
      dietTag.description = description;
    }

    return this.dietTagRepository.save(dietTag);
  }

  async delete(id: string) {
    const dietTag = await this.findOne(id);
    dietTag.is_active = false;
    await this.dietTagRepository.save(dietTag);

    return { message: 'Diet tag deleted successfully' };
  }
}
