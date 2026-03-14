import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationTypesService } from './notification-types.service';
import { CreateNotificationTypeDto } from './dto/create-notification-type.dto';
import { UpdateNotificationTypeDto } from './dto/update-notification-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notification-types')
@Controller('notification-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationTypesController {
  constructor(
    private readonly notificationTypesService: NotificationTypesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all notification types' })
  @ApiQuery({ name: 'include_inactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Notification types retrieved' })
  async getAllTypes(@Query('include_inactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return this.notificationTypesService.getAllTypes(include);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification type by ID' })
  @ApiResponse({ status: 200, description: 'Notification type retrieved' })
  @ApiResponse({ status: 404, description: 'Notification type not found' })
  async getTypeById(@Param('id') id: string) {
    return this.notificationTypesService.getTypeById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create custom notification type' })
  @ApiResponse({ status: 201, description: 'Notification type created' })
  @ApiResponse({ status: 409, description: 'Type name already exists' })
  async createType(@Body() createDto: CreateNotificationTypeDto) {
    return this.notificationTypesService.createType(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification type' })
  @ApiResponse({ status: 200, description: 'Notification type updated' })
  @ApiResponse({ status: 404, description: 'Notification type not found' })
  async updateType(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationTypeDto,
  ) {
    return this.notificationTypesService.updateType(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete custom notification type' })
  @ApiResponse({ status: 200, description: 'Notification type deleted' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete default notification types',
  })
  async deleteType(@Param('id') id: string) {
    return this.notificationTypesService.deleteType(id);
  }
}
