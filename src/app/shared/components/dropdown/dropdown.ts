import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';

export type DropdownAlignment = 'left' | 'center' | 'right';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown {
  private host = inject(ElementRef<HTMLElement>);

  public alignment = input<DropdownAlignment>('left');
  public isOpen = signal(false);

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.isOpen() || this.host.nativeElement.contains(event.target as Node)) return;

    this.close();
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.close();
  }

  toggle(): void {
    this.isOpen.update(isOpen => !isOpen);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
