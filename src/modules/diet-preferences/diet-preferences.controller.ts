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
  @ApiOperation({
    summary: 'Get user diet preferences',
    description: 'Returns list of diet tags (vegetarian, vegan, etc.) that the user follows'
  })
  @ApiResponse({
    status: 200,
    description: 'List of diet tags retrieved',
    schema: {
      type: 'array',
      example: [
        { id: 'uuid-1', name: 'vegetarian', description: 'No meat or fish' },
        { id: 'uuid-2', name: 'gluten-free', description: 'No gluten-containing grains' }
      ]
    }
  })
  async getUserPreferences(@CurrentUser() user: User) {
    return this.dietPreferencesService.getUserPreferences(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user diet preferences',
    description: 'Replace all user diet preferences with the provided diet tag IDs. Send empty array to clear all preferences.'
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    schema: {
      type: 'array',
      example: [
        { id: 'uuid-1', name: 'vegetarian', description: 'No meat or fish' }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'One or more diet tags not found' })
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() createDto: CreateDietPreferenceDto,
  ) {
    return this.dietPreferencesService.createPreference(user.id, createDto);
  }

  @Delete(':dietTagId')
  @ApiOperation({
    summary: 'Remove a diet preference',
    description: 'Remove a specific diet tag from user preferences'
  })
  @ApiResponse({ status: 200, description: 'Preference removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deletePreference(
    @CurrentUser() user: User,
    @Param('dietTagId') dietTagId: string,
  ) {
    return this.dietPreferencesService.deletePreference(user.id, dietTagId);
  }
}
