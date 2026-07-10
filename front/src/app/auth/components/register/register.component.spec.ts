import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component['registerForm']().invalid()).toBe(true);
  });

  it('should validate password length (min 8 characters)', () => {
    component['registerModel'].set({ email: 'test@example.com', username: 'testuser', password: 'short', confirmPassword: 'short' });
    fixture.detectChanges();
    expect(component['registerForm']().invalid()).toBe(true);

    component['registerModel'].set({ email: 'test@example.com', username: 'testuser', password: 'longpassword', confirmPassword: 'longpassword' });
    fixture.detectChanges();
    expect(component['registerForm']().valid()).toBe(true);
  });

  it('should invalidate form if passwords do not match', () => {
    component['registerModel'].set({ email: 'test@example.com', username: 'testuser', password: 'longpassword', confirmPassword: 'different' });
    fixture.detectChanges();
    expect(component['registerForm']().invalid()).toBe(true);
  });
});
