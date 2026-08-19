import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksGateway } from '../tasks/tasks.gateway';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly tasksGateway: TasksGateway,
  ) {}

  @Get('tasks/:taskId/comments')
  async findAll(@Param('taskId') taskId: string) {
    const comments = await this.commentsService.findByTask(taskId);
    return { success: true, data: comments };
  }

  @Post('tasks/:taskId/comments')
  async create(
    @Param('taskId') taskId: string,
    @Body() body: { content: string; parentComment?: string },
    @Req() req: any,
  ) {
    const comment = await this.commentsService.create(
      taskId,
      req.user._id.toString(),
      body.content,
      body.parentComment,
    );
    this.tasksGateway.server.emit('comment:created', { taskId, comment });
    return { success: true, data: comment };
  }

  @Patch('comments/:id')
  async update(@Param('id') id: string, @Body() body: { content: string }) {
    const comment = await this.commentsService.update(id, body.content);
    return { success: true, data: comment };
  }

  @Delete('comments/:id')
  async remove(@Param('id') id: string) {
    await this.commentsService.delete(id);
    return { success: true, message: 'Comment deleted' };
  }
}
