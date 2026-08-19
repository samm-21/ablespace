import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    PassportModule,
    // registerAsync reads ConfigService AFTER .env has been loaded by ConfigModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'pyramid_super_secret',
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any },
      }),
    }),
    UsersModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
