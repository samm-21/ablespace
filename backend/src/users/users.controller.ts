import { Controller, Get, Post, Patch, Delete, Body, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    return { success: true, data: req.user };
  }

  // Search users by email for member autocomplete
  @Get('search')
  async searchUsers(@Query('email') email: string) {
    if (!email || email.length < 2) return { success: true, data: [] };
    const users = await this.usersService.searchByEmail(email);
    return { success: true, data: users };
  }

  // Resolve or create user by email (for adding members)
  @Post('resolve-by-email')
  async resolveByEmail(@Body() body: { email: string }) {
    if (!body.email) return { success: false, message: 'Email required' };
    const user = await this.usersService.findOrCreateByEmail(body.email.trim().toLowerCase());
    return { success: true, data: user };
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    const { theme, colorMode, ...rest } = body;
    const updated = await this.usersService.updateMe(req.user._id, rest);
    return { success: true, data: updated };
  }

  @Patch('me/preferences')
  async updatePreferences(@Req() req: any, @Body() body: { theme?: string; colorMode?: string }) {
    const updated = await this.usersService.updatePreferences(req.user._id, body);
    return { success: true, data: updated };
  }

  @Delete('me')
  async deleteMe(@Req() req: any) {
    await this.usersService.delete(req.user._id);
    return { success: true, message: 'Account deleted' };
  }
}
