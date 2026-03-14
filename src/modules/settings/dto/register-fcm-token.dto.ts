import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum FcmDeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
}

export class RegisterFcmTokenDto {
  @ApiProperty({ description: 'FCM registration token' })
  @IsString()
  @IsNotEmpty()
  fcm_token: string;

  @ApiProperty({ enum: FcmDeviceType, required: false })
  @IsOptional()
  @IsEnum(FcmDeviceType)
  device_type?: FcmDeviceType;
}
