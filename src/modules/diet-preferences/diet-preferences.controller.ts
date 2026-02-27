import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { DietPreferencesService } from './diet-preferences.service';
import { CreateDietPreferenceDto } from './dto/create-diet-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('diet-preferences')
@Controller('diet-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DietPreferencesController {
  constructor(
    private readonly dietPreferencesService: DietPreferencesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user diet preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved' })
  async getUserPreferences(@CurrentUser() user: User) {
    return this.dietPreferencesService.getUserPreferences(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create diet preference' })
  @ApiResponse({ status: 201, description: 'Preference created' })
  async createPreference(
    @CurrentUser() user: User,
    @Body() createDto: CreateDietPreferenceDto,
  ) {
    return this.dietPreferencesService.createPreference(user.id, createDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete diet preference' })
  @ApiResponse({ status: 200, description: 'Preference deleted' })
  async deletePreference(
    @CurrentUser() user: User,
    @Param('id') preferenceId: string,
  ) {
    return this.dietPreferencesService.deletePreference(user.id, preferenceId);
  }
}
