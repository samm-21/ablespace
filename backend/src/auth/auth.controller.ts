import { Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  async guestLogin() {
    const result = await this.authService.createGuestUser();
    return { success: true, data: result };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Initiates Google OAuth redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.validateGoogleUser(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return { success: true, data: req.user };
  }
}
