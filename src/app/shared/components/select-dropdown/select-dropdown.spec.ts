import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDropdown } from './select-dropdown';

describe('SelectDropdown', () => {
  let component: SelectDropdown;
  let fixture: ComponentFixture<SelectDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectDropdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
