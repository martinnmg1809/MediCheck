import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTratamiento } from './editar-tratamiento';

describe('EditarTratamiento', () => {
  let component: EditarTratamiento;
  let fixture: ComponentFixture<EditarTratamiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTratamiento],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarTratamiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
