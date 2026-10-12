import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Modal } from './modal';
import { ModalService } from '../../services/modal.service';

interface ProfileForm {
  name: string;
}

@Component({
  imports: [
    FormsModule,
    Modal,
  ],
  template: `
    <app-modal
      modalId="profile"
      title="Profile"
      [data]="profile"
      [transform]="trimProfile"
      (onSubmit)="submitted = $event"
    >
      <ng-template let-draft let-update="update">
        <input
          name="name"
          [ngModel]="draft?.name"
          (ngModelChange)="update({ ...draft, name: $event })"
        />
      </ng-template>
    </app-modal>
  `,
})
class ModalHost {
  public profile: ProfileForm = { name: 'Ada' };
  public submitted: ProfileForm | null = null;

  trimProfile(profile: ProfileForm | null): ProfileForm {
    return { name: profile?.name.trim() ?? '' };
  }
}

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('modalId', 'test-modal');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Modal integration', () => {
  let fixture: ComponentFixture<ModalHost>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHost],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalHost);
    modalService = TestBed.inject(ModalService);
  });

  it('should render only the active modal', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();

    modalService.open('profile');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('should submit transformed draft data from projected form content', () => {
    modalService.open('profile');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = ' Grace ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted).toEqual({ name: 'Grace' });
    expect(modalService.currentModal()).toBeNull();
  });
});
