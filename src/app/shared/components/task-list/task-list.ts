import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, input, linkedSignal, output, signal } from '@angular/core';
import { TaskModel } from '../../../core/models/task.model';
import { LucideCheck, LucideLoaderCircle, LucidePause, LucidePlay, LucideRefreshCcw, LucideTrash } from '@lucide/angular';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

interface RunningTaskTimer {
  duration: number;
  startedAt: number;
}

@Component({
  selector: 'app-task-list',
  imports: [
    LucidePlay,
    LucidePause,
    LucideTrash,
    LucideCheck,
    LucideRefreshCcw,
    LucideLoaderCircle,
    FormsModule,
    NgClass
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList implements OnInit, OnDestroy {
  private readonly storageKeyPrefix = 'focumeister:task-timer';
  private timerId: any = null;
  public data = input.required<TaskModel>();
  public task = linkedSignal<TaskModel>(() => ({ ...this.data() }));
  public description = linkedSignal<string>(() => this.data().description);

  public onUpdate = output<TaskModel>();
  public onDelete = output<number>();
  public isDeleting: boolean = false;
  public isStartTask = signal<boolean>(false);
  
  public elapsedTime = computed(() => {
    const hours = Math.floor(this.task().duration / 3600);
    const minutes = Math.floor((this.task().duration % 3600) / 60);
    const seconds = Math.floor((this.task().duration % 3600) % 60);
    
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  })

  ngOnInit() {
    this.resumePersistedTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTask() {
    this.isStartTask.update(state => !state);

    if(this.isStartTask()) {
      this.persistTimer({
        duration: this.task().duration,
        startedAt: Date.now(),
      });
      this.startTimer();
    }
    else {
      this.stopTimer();
      this.clearPersistedTimer();
      this.emitTask();
    }
  }

  updateDescription() {
    const description = this.description().trim();
    if(description === this.task().description) return;

    this.task.update(task => ({ ...task, description }));
    this.emitTask();
  }

  emitTask(): void {
    this.onUpdate.emit(this.task());
  }

  completeTask() {
    this.task.update(item => ({ ...item, completed: !item.completed }))
    this.emitTask();
  }

  private stopTimer() {
    if(!this.timerId) return;

    clearInterval(this.timerId);
    this.timerId = null;
  }

  private startTimer() {
    this.stopTimer();

    this.timerId = setInterval(() => {
      if(this.syncDurationWithPersistedTimer()) return;

      this.task.update(task => ({ ...task, duration: task.duration + 1 }));
    }, 1000);
  }

  private resumePersistedTimer() {
    const timer = this.getPersistedTimer();
    if(!timer) return;

    this.syncDurationWithPersistedTimer();
    this.isStartTask.set(true);
    this.startTimer();
  }

  private syncDurationWithPersistedTimer(): boolean {
    const timer = this.getPersistedTimer();
    if(!timer) return false;

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timer.startedAt) / 1000));
    const duration = timer.duration + elapsedSeconds;
    this.task.update(task => ({ ...task, duration }));
    return true;
  }

  private persistTimer(timer: RunningTaskTimer) {
    try {
      this.storage?.setItem(this.storageKey, JSON.stringify(timer));
    } catch {
      return;
    }
  }

  private getPersistedTimer(): RunningTaskTimer | null {
    let rawTimer: string | null | undefined;

    try {
      rawTimer = this.storage?.getItem(this.storageKey);
    } catch {
      return null;
    }

    if(!rawTimer) return null;

    try {
      const timer = JSON.parse(rawTimer) as RunningTaskTimer;

      if(typeof timer.duration !== 'number' || typeof timer.startedAt !== 'number') {
        this.clearPersistedTimer();
        return null;
      }

      return timer;
    } catch {
      this.clearPersistedTimer();
      return null;
    }
  }

  private clearPersistedTimer() {
    try {
      this.storage?.removeItem(this.storageKey);
    } catch {
      return;
    }
  }

  private get storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }

  private get storageKey() {
    return `${this.storageKeyPrefix}:${this.task().id}`;
  }
}
