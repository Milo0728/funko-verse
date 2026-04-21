import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, Lock, Sparkles, LogIn } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'fv-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div class="fv-card p-8 max-w-md w-full fv-fade-in">
        <div class="flex items-center gap-2 mb-6">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center">
            <lucide-icon [img]="Sparkles" [size]="20" class="text-white"/>
          </span>
          <h1 class="text-2xl font-black text-white">Bienvenido otaku</h1>
        </div>
        <p class="text-slate-400 text-sm mb-6">Inicia sesión para continuar tu viaje FunkoVerse.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="text-sm text-slate-300 flex items-center gap-2 mb-1">
              <lucide-icon [img]="Mail" [size]="14"/> Email
            </label>
            <input
              type="email"
              formControlName="email"
              class="fv-input"
              placeholder="tu@correo.com"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="text-sm text-slate-300 flex items-center gap-2 mb-1">
              <lucide-icon [img]="Lock" [size]="14"/> Contraseña
            </label>
            <input
              type="password"
              formControlName="password"
              class="fv-input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          @if (error()) {
            <p class="text-sm text-rose-400">{{ error() }}</p>
          }

          <button
            type="submit"
            class="fv-btn fv-btn-primary w-full"
            [disabled]="form.invalid || loading()"
          >
            <lucide-icon [img]="LogIn" [size]="16"/>
            {{ loading() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>

        <div class="flex items-center justify-between mt-5 text-sm">
          <a routerLink="/auth/forgot" class="text-slate-400 hover:text-cyan-300">
            ¿Olvidaste tu contraseña?
          </a>
          <a routerLink="/auth/register" class="text-violet-300 hover:text-violet-200 font-semibold">
            Crear cuenta
          </a>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Sparkles = Sparkles;
  readonly LogIn = LogIn;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      this.toast.success('¡Hola de nuevo!');
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
      await this.router.navigateByUrl(returnUrl);
    } catch (e) {
      this.error.set(this.parseError(e));
    } finally {
      this.loading.set(false);
    }
  }

  private parseError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    if (code.includes('user-not-found')) return 'No existe un usuario con ese email.';
    if (code.includes('wrong-password')) return 'La contraseña es incorrecta.';
    if (code.includes('invalid-credential')) return 'Credenciales inválidas.';
    return 'No pudimos iniciar sesión. Revisa tu conexión.';
  }
}
