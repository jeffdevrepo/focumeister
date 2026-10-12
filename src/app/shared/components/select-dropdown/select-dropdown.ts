import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

@Component({
  selector: 'app-select-dropdown',
  imports: [
    LucideCheck,
    LucideChevronDown,
  ],
  templateUrl: './select-dropdown.html',
  styleUrl: './select-dropdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDropdown),
      multi: true,
    },
  ],
})
export class SelectDropdown implements ControlValueAccessor {
  private host = inject(ElementRef<HTMLElement>);
  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  public options = input<readonly unknown[]>([]);
  public valueKey = input<string>('value');
  public labelKey = input<string>('label');
  public placeholder = input<string>('Select an option');
  public disabled = input(false, { transform: booleanAttribute });
  public compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);

  public isOpen = signal(false);
  public value = signal<unknown>(null);
  private formDisabled = signal(false);

  public isDisabled = computed(() => this.disabled() || this.formDisabled());

  public selectedOption = computed(() =>
    this.options().find(option => this.compareWith()(this.getOptionValue(option), this.value()))
  );

  public selectedLabel = computed(() => {
    const option = this.selectedOption();

    return option ? this.getOptionLabel(option) : this.placeholder();
  });

  public longestOptionLabel = computed(() => {
    const labels = this.options().map(option => this.getOptionLabel(option));

    return labels.reduce(
      (longest, label) => label.length > longest.length ? label : longest,
      this.options().length ? '' : this.placeholder()
    );
  });

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent) {
    if(!this.isOpen() || this.host.nativeElement.contains(event.target as Node)) return;

    this.close();
  }

  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);

    if(isDisabled) {
      this.isOpen.set(false);
    }
  }

  toggle() {
    if(this.isDisabled()) return;

    this.isOpen.update(isOpen => !isOpen);
  }

  selectOption(option: unknown) {
    if(this.isOptionDisabled(option)) return;

    const value = this.getOptionValue(option);

    this.value.set(value);
    this.onChange(value);
    this.close();
  }

  getOptionValue(option: unknown): unknown {
    return this.isObjectOption(option) ? option[this.valueKey()] : option;
  }

  getOptionLabel(option: unknown): string {
    const label = this.isObjectOption(option) ? option[this.labelKey()] : option;

    return String(label ?? '');
  }

  isSelected(option: unknown): boolean {
    return this.compareWith()(this.getOptionValue(option), this.value());
  }

  isOptionDisabled(option: unknown): boolean {
    return this.isObjectOption(option) && option['disabled'] === true;
  }

  trackOption = (_: number, option: unknown) => this.getOptionValue(option);

  private close() {
    this.isOpen.set(false);
    this.onTouched();
  }

  private isObjectOption(option: unknown): option is Record<string, unknown> {
    return typeof option === 'object' && option !== null;
  }
}
