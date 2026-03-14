import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from './entities/notification-type.entity';
import { CreateNotificationTypeDto } from './dto/create-notification-type.dto';
import { UpdateNotificationTypeDto } from './dto/update-notification-type.dto';

@Injectable()
export class NotificationTypesService {
  constructor(
    @InjectRepository(NotificationType)
    private notificationTypeRepository: Repository<NotificationType>,
  ) {}

  async getAllTypes(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { is_active: true };
    return this.notificationTypeRepository.find({
      where,
      order: { is_default: 'DESC', created_at: 'ASC' },
    });
  }

  async getTypeById(id: string) {
    const type = await this.notificationTypeRepository.findOne({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException('Notification type not found');
    }

    return type;
  }

  async createType(createDto: CreateNotificationTypeDto) {
    // Check if name already exists
    const existing = await this.notificationTypeRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Notification type with name '${createDto.name}' already exists`,
      );
    }

    const notificationType = this.notificationTypeRepository.create({
      ...createDto,
      is_default: false, // Custom types are never default
    });

    await this.notificationTypeRepository.save(notificationType);

    return notificationType;
  }

  async updateType(id: string, updateDto: UpdateNotificationTypeDto) {
    const notificationType = await this.getTypeById(id);

    // Prevent updating default types' core properties
    if (notificationType.is_default) {
      // Only allow updating is_active for default types
      if (Object.keys(updateDto).some((key) => key !== 'is_active')) {
        throw new BadRequestException(
          'Can only update is_active for default notification types',
        );
      }
    }

    Object.assign(notificationType, updateDto);

    await this.notificationTypeRepository.save(notificationType);

    return notificationType;
  }

  async deleteType(id: string) {
    const notificationType = await this.getTypeById(id);

    // Prevent deleting default types
    if (notificationType.is_default) {
      throw new BadRequestException('Cannot delete default notification types');
    }

    await this.notificationTypeRepository.delete(id);

    return { message: 'Notification type deleted successfully' };
  }
}
