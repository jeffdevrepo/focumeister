import { inject, Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ProjectModel } from '../../models/project.model';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private supabase = inject(SupabaseService).client;

  getProjects(): Observable<any> {
    const req = this.supabase.from('project').select('*');

    return from(req).pipe(map((res: any) => res.data ))
  }

  addProject(project: ProjectModel): Observable<any> {
    const req = this.supabase.from('project').insert(project).select('*').single();

    return from(req).pipe(map((res: any) => res.data))
  }

  deleteProject(id: number): Observable<any> {
    const req = this.supabase.from('project').delete().eq('id', id).select('*').single();

    return from(req).pipe(map((res: any) => res.data));
  }
}
