import { Injectable, signal } from '@angular/core';
import { defer, finalize, Observable, ReplaySubject, take } from 'rxjs';

export interface ConfirmationDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly currentRequest = signal<ConfirmationDialogOptions | null>(null);
  private resultSubject: ReplaySubject<boolean> | null = null;

  public readonly request = this.currentRequest.asReadonly();

  confirm(options: ConfirmationDialogOptions): Observable<boolean> {
    return defer(() => {
      this.finish(false);

      const result = new ReplaySubject<boolean>(1);
      this.resultSubject = result;
      this.currentRequest.set(options);

      return result.pipe(
        take(1),
        finalize(() => {
          if (this.resultSubject === result) this.finish(false);
        }),
      );
    });
  }

  confirmCurrent(): void {
    this.finish(true);
  }

  cancelCurrent(): void {
    this.finish(false);
  }

  private finish(confirmed: boolean): void {
    const result = this.resultSubject;
    this.resultSubject = null;
    this.currentRequest.set(null);

    if (!result) return;

    result.next(confirmed);
    result.complete();
  }
}
