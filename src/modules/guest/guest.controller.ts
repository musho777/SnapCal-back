import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { GuestService } from './guest.service';
import { CreateGuestSessionDto } from './dto/create-guest-session.dto';
import { ConvertGuestDto } from './dto/convert-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

@ApiTags('guests')
@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create guest session for anonymous users' })
  @ApiResponse({ status: 201, description: 'Guest session created' })
  async createGuestSession(
    @Body() createGuestDto: CreateGuestSessionDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    return this.guestService.createGuestSession(
      createGuestDto,
      ipAddress,
      userAgent,
    );
  }

  @Post('convert')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert guest user to registered user' })
  @ApiResponse({ status: 200, description: 'Guest converted successfully' })
  @ApiResponse({ status: 400, description: 'User is not a guest' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async convertGuest(
    @CurrentUser() user: User,
    @Body() convertDto: ConvertGuestDto,
  ) {
    return this.guestService.convertGuestToUser(user.id, convertDto);
  }
}
