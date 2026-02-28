import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';
import { DailyLogResponseDto } from './dto/daily-log-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('logs')
@Controller('logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily log for specific date' })
  @ApiQuery({ name: 'date', type: String, example: '2026-02-27' })
  @ApiResponse({
    status: 200,
    description: 'Daily log retrieved with calculated calories consumed',
    type: DailyLogResponseDto
  })
  async getDailyLog(@CurrentUser() user: User, @Query('date') date: string) {
    return this.logsService.getDailyLog(user.id, date);
  }

  @Get('range')
  @ApiOperation({ summary: 'Get logs by date range' })
  @ApiQuery({ name: 'start_date', type: String, example: '2026-02-20' })
  @ApiQuery({ name: 'end_date', type: String, example: '2026-02-27' })
  @ApiResponse({
    status: 200,
    description: 'Logs retrieved with calculated calories consumed',
    type: [DailyLogResponseDto]
  })
  async getLogsByRange(
    @CurrentUser() user: User,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.logsService.getLogsByDateRange(user.id, startDate, endDate);
  }

  @Put('daily/:date')
  @ApiOperation({
    summary: 'Update daily log',
    description: 'Update calories burned, water intake, or notes. Calories consumed is calculated automatically from meals.'
  })
  @ApiResponse({
    status: 200,
    description: 'Log updated',
    type: DailyLogResponseDto
  })
  async updateDailyLog(
    @CurrentUser() user: User,
    @Param('date') date: string,
    @Body() updateDto: UpdateDailyLogDto,
  ) {
    return this.logsService.updateDailyLog(user.id, date, updateDto);
  }
}
