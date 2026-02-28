import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

export function createAuthProviders(configService: ConfigService) {
  const providers: any[] = [
    JwtStrategy, // Always include JWT strategy
  ];

  // Only add OAuth strategies if credentials are configured
  const googleClientId = configService.get<string>('GOOGLE_CLIENT_ID');
  const googleClientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
  if (googleClientId && googleClientSecret) {
    providers.push(GoogleStrategy);
  }

  const appleClientId = configService.get<string>('APPLE_CLIENT_ID');
  const appleTeamId = configService.get<string>('APPLE_TEAM_ID');
  if (appleClientId && appleTeamId) {
    providers.push(AppleStrategy);
  }

  const facebookAppId = configService.get<string>('FACEBOOK_APP_ID');
  const facebookAppSecret = configService.get<string>('FACEBOOK_APP_SECRET');
  if (facebookAppId && facebookAppSecret) {
    providers.push(FacebookStrategy);
  }

  return providers;
}
