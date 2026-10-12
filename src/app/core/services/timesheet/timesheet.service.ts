import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment.development';
import { from, map, Observable, of } from 'rxjs';
import { ProjectModel } from '../../models/project.model';
import { TaskModel } from '../../models/task.model';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TimesheetService {
  private supabase = inject(SupabaseService).client;

  getTasks(projectId: number): Observable<any> {
    const req = this.supabase.from('task').select('*').eq('project_id', projectId);

    return from(req).pipe(map(res => res.data))
  }

  addTasks(task: TaskModel): Observable<any> {
    const req = this.supabase.from('task').insert(task).select('*').single();

    return from(req).pipe(map(res => res.data))
  }

  updateTask(task: TaskModel): Observable<any> {
    const req = this.supabase.from('task').update(task).eq('id', task.id);

    return from(req).pipe(map(res => res));
  }

  deleteTask(id: number): Observable<any> {
    const req = this.supabase.from('task').delete().eq('id', id).select('*').single();

    return from(req).pipe(map(res => res.data))
  }
}
