import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { form, FormField, submit, required, email } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loginModel = signal({
    email: '',
    password: ''
  });

  protected readonly loginForm = form(this.loginModel, (s) => {
    required(s.email, { message: 'El correo electrónico es obligatorio' });
    email(s.email, { message: 'El correo electrónico no es válido' });
    required(s.password, { message: 'La contraseña es obligatoria' });
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  public ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['registered'] === 'true') {
        this.successMessage.set('¡Registro completado con éxito! Por favor, inicia sesión.');
      }
    });
  }

  protected onSubmit(): void {
    submit(this.loginForm, async () => {
      this.errorMessage.set(null);
      this.successMessage.set(null);
      const credentials = this.loginModel();
      try {
        await firstValueFrom(this.authService.login(credentials.email, credentials.password));
        this.router.navigate(['/standings']);
      } catch (err: any) {
        const errMsg = err.error?.message || 'Error al iniciar sesión. Por favor, inténtelo de nuevo.';
        this.errorMessage.set(errMsg);
      }
    });
  }
}
