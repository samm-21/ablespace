import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  emitTaskCreated(task: any) {
    this.server.emit('task:created', task);
  }

  emitTaskUpdated(task: any) {
    this.server.emit('task:updated', task);
  }

  emitTaskDeleted(taskId: string) {
    this.server.emit('task:deleted', { id: taskId });
  }
}
