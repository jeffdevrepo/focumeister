import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TaskTimerCoordinatorService {
  private activeTaskId: number | null = null;
  private readonly pauseHandlers = new Map<number, () => void>();

  register(taskId: number, pause: () => void): () => void {
    this.pauseHandlers.set(taskId, pause);

    return () => {
      if (this.pauseHandlers.get(taskId) !== pause) return;

      this.pauseHandlers.delete(taskId);

      if (this.activeTaskId === taskId) this.activeTaskId = null;
    };
  }

  start(taskId: number): void {
    if (this.activeTaskId === taskId) return;

    if (this.activeTaskId !== null) {
      this.pauseHandlers.get(this.activeTaskId)?.();
    }

    this.activeTaskId = taskId;
  }

  stop(taskId: number): void {
    if (this.activeTaskId === taskId) this.activeTaskId = null;
  }
}
