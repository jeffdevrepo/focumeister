import { computed, Injectable, signal } from '@angular/core';

export interface ModalState<TData = unknown> {
  id: string | null;
  data: TData | null;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly state = signal<ModalState>({
    id: null,
    data: null,
  });

  public readonly currentModal = computed(() => this.state().id);
  public readonly data = computed(() => this.state().data);
  public readonly isOpen = computed(() => this.currentModal() !== null);

  open<TData = unknown>(id: string, data: TData | null = null) {
    this.state.set({ id, data });
  }

  close() {
    this.state.set({ id: null, data: null });
  }

  isActive(id: string): boolean {
    return this.currentModal() === id;
  }

  getData<TData = unknown>(): TData | null {
    return this.data() as TData | null;
  }
}
