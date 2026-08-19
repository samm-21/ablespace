import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private projectsService: ProjectsService,
    private tasksService: TasksService,
  ) {}

  async createGuestUser() {
    const guestName = `Guest${Math.floor(Math.random() * 9000) + 1000}`;
    const user = await this.usersService.create({
      fullName: guestName,
      username: guestName.toLowerCase(),
      isGuest: true,
      email: `${guestName.toLowerCase()}@guest.pyramid`,
    });
    const token = this.jwtService.sign({ sub: user._id.toString(), email: user.email });
    await this.seedDefaultData(user._id.toString());
    return { token, user };
  }

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    fullName: string;
    avatar: string;
  }) {
    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      user = await this.usersService.findByEmail(profile.email);
      if (user) {
        user = await this.usersService.updateMe(user._id.toString(), {
          googleId: profile.googleId,
          avatar: profile.avatar,
        });
      } else {
        user = await this.usersService.create({
          ...profile,
          isGuest: false,
          username: profile.email.split('@')[0],
        });
        await this.seedDefaultData(user._id.toString());
      }
    }
    const token = this.jwtService.sign({ sub: user._id.toString(), email: user.email });
    return { token, user };
  }

  async validateJwtPayload(payload: { sub: string }) {
    return this.usersService.findById(payload.sub);
  }

  private async seedDefaultData(userId: string) {
    const project = await this.projectsService.create({
      name: 'Welcome to Ablespace',
      description: 'Your default project to get started.',
      priority: 'high',
    }, userId);

    const projectId = project._id.toString();

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueDateStr = nextWeek.toISOString();

    // 1 To Do
    await this.tasksService.create({
      title: 'Sample Task 1 - Read the documentation',
      description: 'Welcome to your Kanban board! You can drag this card to another column or click on it to edit its details.',
      status: 'todo',
      priority: 'high',
      project: projectId,
      members: [userId],
      dueDate: dueDateStr,
    }, userId);

    // 2 Doing
    await this.tasksService.create({
      title: 'Sample Task 2 - Testing drag and drop',
      description: 'Try dragging me to the "Done" column.',
      status: 'doing',
      priority: 'medium',
      project: projectId,
      members: [userId],
      dueDate: dueDateStr,
    }, userId);

    await this.tasksService.create({
      title: 'Sample Task 3 - Checking out the UI',
      description: 'Explore the different features like adding subtasks and comments.',
      status: 'doing',
      priority: 'low',
      project: projectId,
      members: [userId],
      dueDate: dueDateStr,
    }, userId);

    // 1 Completed
    await this.tasksService.create({
      title: 'Sample Task 4 - Sign up successfully',
      description: 'You have successfully created an account and are ready to use the app!',
      status: 'completed',
      priority: 'high',
      project: projectId,
      members: [userId],
      dueDate: dueDateStr,
    }, userId);
  }
}
