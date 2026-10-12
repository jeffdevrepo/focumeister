export class TaskModel {
    public id!: number;
    public project_id!: number;
    public description!: string;
    public duration!: number;
    public start!: Date | string;
    public end!: Date | string;
    public date_created!: Date | string;
    public date_updated!: Date | string;

    constructor(task: Partial<TaskModel>) {
        Object.assign(this, task);
    }
}