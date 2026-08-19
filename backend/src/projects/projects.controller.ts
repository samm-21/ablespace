import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { TasksService } from '../tasks/tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  async findAll(@Query() query: { search?: string; priority?: string }, @Req() req: any) {
    const projects = await this.projectsService.findAll({ ...query, userId: req.user._id.toString() });
    return { success: true, data: projects };
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const project = await this.projectsService.create(body, req.user._id.toString());
    return { success: true, data: project };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findById(id);
    return { success: true, data: project };
  }

  @Get(':id/tasks')
  async getProjectTasks(@Param('id') id: string, @Query() query: any) {
    const tasks = await this.tasksService.findAll({ ...query, projectId: id });
    return { success: true, data: tasks };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const project = await this.projectsService.update(id, body);
    return { success: true, data: project };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.projectsService.delete(id);
    return { success: true, message: 'Project deleted' };
  }
}
