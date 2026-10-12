export class ProjectModel {
    public id!: number;
    public name: string = '';
    public email: string = '';
    public date_created: Date | string | undefined = undefined;

    constructor(project: Partial<ProjectModel>) {
        Object.assign(this, project);
    }
}