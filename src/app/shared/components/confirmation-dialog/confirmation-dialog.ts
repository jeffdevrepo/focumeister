import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialog {
  public dialog = inject(ConfirmationDialogService);

  @HostListener('document:keydown.escape')
  cancelOnEscape(): void {
    if (this.dialog.request()) this.dialog.cancelCurrent();
  }

  cancelOnBackdrop(event: MouseEvent): void {
    if (event.target !== event.currentTarget) return;

    this.dialog.cancelCurrent();
  }
}
