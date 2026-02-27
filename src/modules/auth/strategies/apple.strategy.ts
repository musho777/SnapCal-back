import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-apple';
import * as fs from 'fs';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private configService: ConfigService) {
    const keyPath = configService.get<string>('APPLE_PRIVATE_KEY_PATH');
    const privateKey = keyPath && fs.existsSync(keyPath)
      ? fs.readFileSync(keyPath, 'utf8')
      : '';

    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID'),
      teamID: configService.get<string>('APPLE_TEAM_ID'),
      keyID: configService.get<string>('APPLE_KEY_ID'),
      privateKey: privateKey,
      callbackURL: configService.get<string>('APPLE_CALLBACK_URL'),
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: any,
  ): Promise<any> {
    const user = {
      provider: 'apple',
      provider_user_id: profile.id,
      email: profile.email,
      first_name: profile.name?.firstName || null,
      last_name: profile.name?.lastName || null,
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    done(null, user);
  }
}
