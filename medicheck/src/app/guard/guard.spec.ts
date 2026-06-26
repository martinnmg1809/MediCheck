import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
  });

  it('debe permitir el acceso si existe user_id aunque no haya token', () => {
    localStorage.setItem('user_id', '42');

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBeTrue();
  });

  it('debe denegar el acceso si la sesión ya expiró', () => {
    localStorage.setItem('user_id', '42');
    localStorage.setItem('session_expires_at', (Date.now() - 1000).toString());

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBeFalse();
    expect(localStorage.getItem('user_id')).toBeNull();
  });
});
