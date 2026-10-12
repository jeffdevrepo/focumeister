import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  DestroyRef,
  HostListener,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { ModalService } from '../../services/modal.service';

export interface ModalTemplateContext<TData> {
  $implicit: TData | null;
  data: TData | null;
  update: (data: TData | null) => void;
  close: () => void;
}

@Component({
  selector: 'app-modal',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    LucideX,
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal<TData = unknown, TResult = TData> {
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly animationDurationMs = 180;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  @ContentChild(TemplateRef) public contentTemplate?: TemplateRef<ModalTemplateContext<TData>>;

  public modalId = input.required<string>();
  public title = input<string>('');
  public submitLabel = input<string>('Save');
  public cancelLabel = input<string>('Cancel');
  public data = input<TData | null>(null);
  public transform = input<(data: TData | null) => TResult>((data) => data as TResult);

  public onSubmit = output<TResult>();
  public onClose = output<void>();

  public serviceData = computed(() => this.modalService.getData<TData>());
  public isOpen = computed(() => this.modalService.isActive(this.modalId()));
  public shouldRender = signal(false);
  public isClosing = signal(false);

  public sourceData = computed(() => {
    const serviceData = this.serviceData();

    return serviceData ?? this.data();
  });

  public draft = linkedSignal<TData | null>(() => this.cloneData(this.sourceData()));

  public context = computed<ModalTemplateContext<TData>>(() => ({
    $implicit: this.draft(),
    data: this.draft(),
    update: (data) => this.updateDraft(data),
    close: () => this.close(),
  }));

  constructor() {
    effect(() => {
      if(this.isOpen()) {
        this.clearCloseTimer();
        this.isClosing.set(false);
        this.shouldRender.set(true);
        return;
      }

      if(this.shouldRender() && !this.isClosing()) {
        this.startCloseAnimation(false);
      }
    });

    this.destroyRef.onDestroy(() => this.clearCloseTimer());
  }

  @HostListener('document:keydown.escape')
  closeOnEscape() {
    this.close();
  }

  submit() {
    this.onSubmit.emit(this.transform()(this.draft()));
    this.close();
  }

  close() {
    if(!this.isOpen() && !this.shouldRender()) return;

    this.startCloseAnimation(true);
  }

  updateDraft(data: TData | null) {
    this.draft.set(data);
  }

  closeOnBackdrop(event: MouseEvent) {
    if(event.target !== event.currentTarget) return;

    this.close();
  }

  private startCloseAnimation(emitClose: boolean) {
    this.clearCloseTimer();
    this.isClosing.set(true);

    if(this.isOpen()) {
      this.modalService.close();
    }

    if(emitClose) {
      this.onClose.emit();
    }

    this.closeTimer = setTimeout(() => {
      this.shouldRender.set(false);
      this.isClosing.set(false);
      this.closeTimer = null;
    }, this.animationDurationMs);
  }

  private clearCloseTimer() {
    if(!this.closeTimer) return;

    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }

  private cloneData(data: TData | null): TData | null {
    if(data === null || data === undefined) return null;

    if(typeof structuredClone === 'function') {
      return structuredClone(data);
    }

    if(Array.isArray(data)) {
      return [ ...data ] as TData;
    }

    if(typeof data === 'object') {
      return { ...data } as TData;
    }

    return data;
  }
}
