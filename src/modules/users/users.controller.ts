import {
  Controller,
  Get,
  Put,
  Post,
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
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateBodyMeasurementDto } from './dto/create-body-measurement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateDto);
  }

  @Get('measurements')
  @ApiOperation({ summary: 'Get body measurements history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Measurements retrieved' })
  async getBodyMeasurements(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getBodyMeasurements(user.id, limit);
  }

  @Post('measurements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create body measurement' })
  @ApiResponse({ status: 201, description: 'Measurement created' })
  async createBodyMeasurement(
    @CurrentUser() user: User,
    @Body() createDto: CreateBodyMeasurementDto,
  ) {
    return this.usersService.createBodyMeasurement(user.id, createDto);
  }

  @Delete('measurements/:id')
  @ApiOperation({ summary: 'Delete body measurement' })
  @ApiResponse({ status: 200, description: 'Measurement deleted' })
  async deleteBodyMeasurement(
    @CurrentUser() user: User,
    @Param('id') measurementId: string,
  ) {
    return this.usersService.deleteBodyMeasurement(user.id, measurementId);
  }
}
