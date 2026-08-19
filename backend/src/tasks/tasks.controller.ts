import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksGateway } from './tasks.gateway';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly tasksGateway: TasksGateway,
  ) {}

  @Get()
  async findAll(@Query() query: { status?: string; priority?: string; search?: string; projectId?: string }, @Req() req: any) {
    const tasks = await this.tasksService.findAll({ ...query, userId: req.user._id.toString() });
    return { success: true, data: tasks };
  }

  @Post()
  async create(@Body() dto: CreateTaskDto, @Req() req: any) {
    const task = await this.tasksService.create(dto, req.user._id.toString());
    this.tasksGateway.emitTaskCreated(task);
    return { success: true, data: task };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findById(id);
    return { success: true, data: task };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const task = await this.tasksService.update(id, dto);
    this.tasksGateway.emitTaskUpdated(task);
    return { success: true, data: task };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tasksService.delete(id);
    this.tasksGateway.emitTaskDeleted(id);
    return { success: true, message: 'Task deleted' };
  }

  @Patch(':id/reorder')
  async reorder(@Param('id') id: string, @Body() body: { status: string; order: number }) {
    const task = await this.tasksService.reorder(id, body.status, body.order);
    this.tasksGateway.emitTaskUpdated(task);
    return { success: true, data: task };
  }

  // Subtasks
  @Post(':id/subtasks')
  async addSubtask(@Param('id') id: string, @Body() body: { title: string; priority?: string; dueDate?: string }) {
    const task = await this.tasksService.addSubtask(id, body);
    this.tasksGateway.emitTaskUpdated(task);
    return { success: true, data: task };
  }

  @Patch(':id/subtasks/:subtaskId')
  async updateSubtask(@Param('id') id: string, @Param('subtaskId') subtaskId: string, @Body() body: any) {
    const task = await this.tasksService.updateSubtask(id, subtaskId, body);
    this.tasksGateway.emitTaskUpdated(task);
    return { success: true, data: task };
  }

  @Delete(':id/subtasks/:subtaskId')
  async deleteSubtask(@Param('id') id: string, @Param('subtaskId') subtaskId: string) {
    const task = await this.tasksService.deleteSubtask(id, subtaskId);
    this.tasksGateway.emitTaskUpdated(task);
    return { success: true, data: task };
  }
}
