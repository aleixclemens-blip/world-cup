import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, submit, required, email, minLength, validate } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormField, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly registerModel = signal({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  protected readonly registerForm = form(this.registerModel, (s) => {
    required(s.email, { message: 'El correo electrónico es obligatorio' });
    email(s.email, { message: 'El correo electrónico no es válido' });
    required(s.username, { message: 'El nombre de usuario es obligatorio' });
    minLength(s.username, 3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' });
    required(s.password, { message: 'La contraseña es obligatoria' });
    minLength(s.password, 8, { message: 'La contraseña debe tener al menos 8 caracteres' });
    required(s.confirmPassword, { message: 'Por favor, repita la contraseña' });
    validate(s.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(s.password)) {
        return { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden' };
      }
      return undefined;
    });
  });

  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    submit(this.registerForm, async () => {
      this.errorMessage.set(null);
      const { email, username, password } = this.registerModel();
      try {
        await firstValueFrom(this.authService.register(email, username, password));
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      } catch (err: any) {
        const errMsg = err.error?.message || 'Error al registrarse. Por favor, inténtelo de nuevo.';
        this.errorMessage.set(errMsg);
      }
    });
  }
}
