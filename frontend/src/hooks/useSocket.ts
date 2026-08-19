'use client';
import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { Task, Comment } from '@/types';

interface SocketHandlers {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (data: { id: string }) => void;
  onCommentCreated?: (data: { taskId: string; comment: Comment }) => void;
}

export function useSocket(handlers: SocketHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = getSocket();

    const onTaskCreated = (task: Task) => handlersRef.current.onTaskCreated?.(task);
    const onTaskUpdated = (task: Task) => handlersRef.current.onTaskUpdated?.(task);
    const onTaskDeleted = (data: { id: string }) => handlersRef.current.onTaskDeleted?.(data);
    const onCommentCreated = (data: { taskId: string; comment: Comment }) =>
      handlersRef.current.onCommentCreated?.(data);

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('comment:created', onCommentCreated);

    return () => {
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('comment:created', onCommentCreated);
    };
  }, []);
}
