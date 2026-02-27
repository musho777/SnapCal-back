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
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateCalorieTargetDto } from './dto/create-calorie-target.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  async getSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(user.id, updateDto);
  }

  @Get('calorie-target/current')
  @ApiOperation({ summary: 'Get current calorie target with fallback' })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Calorie target retrieved' })
  async getCurrentCalorieTarget(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    return this.settingsService.getCurrentCalorieTarget(user.id, date);
  }

  @Get('calorie-targets')
  @ApiOperation({ summary: 'Get calorie targets history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Targets retrieved' })
  async getCalorieTargets(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.settingsService.getCalorieTargets(user.id, limit);
  }

  @Post('calorie-targets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create calorie target snapshot' })
  @ApiResponse({ status: 201, description: 'Target created' })
  async createCalorieTarget(
    @CurrentUser() user: User,
    @Body() createDto: CreateCalorieTargetDto,
  ) {
    return this.settingsService.createCalorieTarget(user.id, createDto);
  }

  @Delete('calorie-targets/:id')
  @ApiOperation({ summary: 'Delete calorie target' })
  @ApiResponse({ status: 200, description: 'Target deleted' })
  async deleteCalorieTarget(
    @CurrentUser() user: User,
    @Param('id') targetId: string,
  ) {
    return this.settingsService.deleteCalorieTarget(user.id, targetId);
  }
}
