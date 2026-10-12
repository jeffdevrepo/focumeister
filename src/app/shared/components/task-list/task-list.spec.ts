import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskList } from './task-list';
import { TaskModel } from '../../../core/models/task.model';

describe('TaskList', () => {
  let component: TaskList;
  let fixture: ComponentFixture<TaskList>;
  const storageKey = 'focumeister:task-timer:1';

  const task = new TaskModel({
    id: 1,
    project_id: 1,
    description: 'Write tests',
    duration: 10,
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString(),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskList],
    }).compileComponents();

    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-09T00:00:00.000Z'));

    fixture = TestBed.createComponent(TaskList);
    fixture.componentRef.setInput('data', task);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should persist the timer when a task starts', () => {
    component.startTask();

    expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}')).toEqual({
      duration: 10,
      startedAt: Date.now(),
    });
  });

  it('should resume a persisted timer and include elapsed time', async () => {
    fixture.destroy();
    localStorage.setItem(storageKey, JSON.stringify({
      duration: 10,
      startedAt: Date.now() - 5000,
    }));

    fixture = TestBed.createComponent(TaskList);
    fixture.componentRef.setInput('data', task);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isStartTask()).toBe(true);
    expect(component.task().duration).toBe(15);
  });
});
