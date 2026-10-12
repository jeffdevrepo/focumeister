import { TestBed } from '@angular/core/testing';

import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a modal with data', () => {
    service.open('edit-task', { description: 'Write tests' });

    expect(service.currentModal()).toBe('edit-task');
    expect(service.isOpen()).toBe(true);
    expect(service.isActive('edit-task')).toBe(true);
    expect(service.getData<{ description: string }>()?.description).toBe('Write tests');
  });

  it('should close the active modal and clear data', () => {
    service.open('edit-task', { description: 'Write tests' });

    service.close();

    expect(service.currentModal()).toBeNull();
    expect(service.isOpen()).toBe(false);
    expect(service.getData()).toBeNull();
  });
});
