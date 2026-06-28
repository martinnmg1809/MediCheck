import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;

  beforeEach(async () => {
    const routerEvents = new Subject<any>();
    const routerStub = {
      url: '/login',
      events: routerEvents.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [{ provide: Router, useValue: routerStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render a compact navbar on authentication routes', () => {
    expect(component.isAuthPage).toBeTrue();
    expect(fixture.nativeElement.querySelector('.navbar-links')).toBeNull();
  });
});
