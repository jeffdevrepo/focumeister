import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucidePlus, LucideTimer, LucideArrowDownToLine, LucideSend } from '@lucide/angular';
import { ProjectService } from '../../core/services/project/project.service';
import { ProjectModel } from '../../core/models/project.model';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { EnvelopeModel } from '../../core/models/envelope.model';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/components/modal/modal';
import { ModalService } from '../../shared/services/modal.service';
import { ProjectForm } from '../../shared/interfaces/project-form.interface';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-home',
  imports: [
    LucideTimer,
    LucidePlus,
    DatePipe,
    LucideSend,
    LucidePlus,
    LucideArrowDownToLine,
    FormsModule,
    Modal
],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private modalService = inject(ModalService);
  private readonly createProjectModalId = 'create-project';
  public projects = signal<EnvelopeModel<ProjectModel[]>>(new EnvelopeModel());
  public newProject = signal<ProjectForm>({
    name: '',
    email: '',
  });

  public toProjectModel = (project: ProjectForm | null): ProjectModel => new ProjectModel({
    name: project?.name.trim() ?? '',
    email: project?.email.trim() ?? '',
    date_created: new Date().toISOString(),
  });

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects() {
    this.projects.update(project => ({ ...project, loading: true }));
    this.projectService.getProjects()
    .pipe(finalize(() => this.projects.update(project => ({ ...project, loading: false }))))
    .subscribe({
      next: (res) => this.projects.update(project => ({ ...project, data: res  })),
      error: (err) => console.log(err)
    })
  }

  viewTimesheet(id: number) {
    this.router.navigate(['timesheet'], {
      queryParams: { id: id }
    })
  }

  addProject(project: ProjectModel) {
    if(!project.name.trim()) return;

    this.projects.update(proj => ({ ...proj, loading: true }))

    this.projectService.addProject(project)
      .pipe(finalize(() => this.projects.update(proj => ({ ...proj, loading: false }))))
      .subscribe({
        next: (res: ProjectModel) => {
          this.projects.update(proj => ({ ...proj, data: [...proj.data || [], res] }))
          this.newProject.set({ name: '', email: '' });
          toast.success('Project has been created.');
        },
        error: (err) => console.log(err),
      });
  }

  openCreateProjectModal() {
    this.modalService.open<ProjectForm>(this.createProjectModalId, this.newProject());
  }
}
