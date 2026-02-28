import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { CreateGuestSessionDto } from "../guest/dto/create-guest-session.dto";
import { ConvertGuestDto } from "../guest/dto/convert-guest.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { AppleAuthGuard } from "./guards/apple-auth.guard";
import { FacebookAuthGuard } from "./guards/facebook-auth.guard";
import { CurrentUser } from "@/common/decorators";
import { User } from "../users/entities/user.entity";
import { AuthProvider } from "@/common/enums";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("guest/session")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Start onboarding - Create your account" })
  @ApiResponse({ status: 201, description: "Account created successfully" })
  async createGuestSession(
    @Body() createGuestDto: CreateGuestSessionDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    return this.authService.createGuestSession(
      createGuestDto,
      ipAddress,
      userAgent,
    );
  }

  @Post("convert")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Register with email - Add email and password to your account",
    description:
      "Submit your email, password, name, and photo. A verification code will be sent to your email.",
  })
  @ApiResponse({ status: 200, description: "Verification code sent to email" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async convertGuest(
    @CurrentUser() user: User,
    @Body() convertDto: ConvertGuestDto,
  ) {
    return this.authService.convertGuestToUser(user.id, convertDto);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify email - Complete registration",
    description:
      "Enter the verification code sent to your email to complete registration",
  })
  @ApiResponse({
    status: 200,
    description: "Email verified, registration completed successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid or expired verification code",
  })
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user info" })
  @ApiResponse({ status: 200, description: "User info retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getCurrentUser(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      is_guest: user.is_guest,
      auth_provider: user.auth_provider,
    };
  }

  // Google OAuth
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth login" })
  async googleAuth() {
    // Initiates OAuth flow
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleAuthCallback(@Req() req) {
    return this.authService.handleOAuthLogin(AuthProvider.GOOGLE, req.user);
  }

  // Apple OAuth
  @Get("apple")
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: "Initiate Apple OAuth login" })
  async appleAuth() {
    // Initiates OAuth flow
  }

  @Get("apple/callback")
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: "Apple OAuth callback" })
  async appleAuthCallback(@Req() req) {
    return this.authService.handleOAuthLogin(AuthProvider.APPLE, req.user);
  }

  // Facebook OAuth
  @Get("facebook")
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: "Initiate Facebook OAuth login" })
  async facebookAuth() {
    // Initiates OAuth flow
  }

  @Get("facebook/callback")
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: "Facebook OAuth callback" })
  async facebookAuthCallback(@Req() req) {
    return this.authService.handleOAuthLogin(AuthProvider.FACEBOOK, req.user);
  }
}
