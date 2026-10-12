import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { TaskList } from '../../shared/components/task-list/task-list';
import { CommonModule } from '@angular/common';
import { LucideLoaderCircle, LucidePlay } from '@lucide/angular';
import { TaskModel } from '../../core/models/task.model';
import { FormsModule, NgForm } from '@angular/forms';
import { TimesheetService } from '../../core/services/timesheet/timesheet.service';
import { ProjectModel } from '../../core/models/project.model';
import { finalize, switchMap } from 'rxjs';
import { toast } from 'ngx-sonner';
import { SelectDropdown } from '../../shared/components/select-dropdown/select-dropdown';
import { ProjectService } from '../../core/services/project/project.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-timesheet',
  imports: [
    TaskList,
    LucidePlay,
    LucideLoaderCircle,
    FormsModule,
    CommonModule,
    SelectDropdown
],
  templateUrl: './timesheet.html',
  styleUrl: './timesheet.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Timesheet implements OnInit {
  private timeSheetService = inject(TimesheetService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);

  public newTaskDescription: string = '';
  public selectedProject = signal<number>(1);
  public tasks = signal<TaskModel[]>([]);
  public projects = signal<ProjectModel[]>([]);
  public taskLoading = signal<boolean>(false);
  public taskAddLoading = signal<boolean>(false);

  constructor() {
    effect(() => this.tasks().sort((a, b) =>
      b.date_created.toLocaleString().localeCompare(a.date_created.toLocaleString())
    ))
  }
  
  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.taskLoading.set(true);
    this.projectService.getProjects().pipe(
      finalize(() => this.taskLoading.set(false)),
      switchMap((projects) => {
        const id = this.route.snapshot.queryParams['id'];

        this.projects.set(projects);
        console.log(id ?? projects[0].id)
        this.selectedProject.set(id ? Number(id) : projects[0].id)
        return this.timeSheetService.getTasks(this.selectedProject())
      }
    ))
    .subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: (err) => console.log(err)
    })
  }

  

  getTasks(projectId: number) {
    this.taskLoading.set(true);
    this.timeSheetService.getTasks(projectId)
    .pipe(finalize(() => this.taskLoading.set(false)))
    .subscribe({
      next: (res: TaskModel[]) => this.tasks.set(res),
      error: (err) => console.log(err)
    })
  }

  addNewTask(form: NgForm) {
    if(!this.newTaskDescription.trim()) return;

    this.taskAddLoading.set(true);

    const task = new TaskModel({
      project_id: this.selectedProject(),
      description: this.newTaskDescription,
      duration: 0,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
    })

    this.timeSheetService.addTasks(task)
      .pipe(finalize(() => {
        this.newTaskDescription = '';
        this.taskAddLoading.set(false);
      }))
      .subscribe({
        next: (res) => {
          if(res === null) {
            toast.error('Something went wrong. Try again.');
            return;
          }

          this.tasks.update(tasks => ([ ...tasks, res ]));
          toast.success('Task has been created.');
        },
        error: (err) => console.log(err),
      })
  }

  updateTask(task: TaskModel) {
    this.timeSheetService.updateTask(task).subscribe({
      next: (res) => {
        if(res.success) {
          toast.success('Task updated successfully!');
        }
      }
    })
  }

  deleteTask(id: number) {
    this.timeSheetService.deleteTask(id).subscribe({
      next: (res) => {
        this.tasks.update(tasks => 
          tasks.filter(task => task.id !== res.id)
        );
        toast.success('Task has been deleted.');
      },
    })
  }
}
