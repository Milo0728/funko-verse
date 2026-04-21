import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, KeyRound } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'fv-forgot-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div class="fv-card p-8 max-w-md w-full fv-fade-in">
        <h1 class="text-2xl font-black text-white mb-2">Recuperar contraseña</h1>
        <p class="text-slate-400 text-sm mb-6">
          Te enviaremos un email con un enlace para restablecer tu contraseña.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="text-sm text-slate-300 flex items-center gap-2 mb-1">
              <lucide-icon [img]="Mail" [size]="14"/> Email
            </label>
            <input type="email" formControlName="email" class="fv-input" placeholder="tu@correo.com"/>
          </div>

          <button type="submit" class="fv-btn fv-btn-primary w-full" [disabled]="form.invalid || loading()">
            <lucide-icon [img]="KeyRound" [size]="16"/>
            {{ loading() ? 'Enviando…' : 'Enviar enlace' }}
          </button>
        </form>

        <p class="text-sm text-slate-400 mt-5 text-center">
          <a routerLink="/auth/login" class="text-violet-300 hover:text-violet-200">Volver al login</a>
        </p>
      </div>
    </div>
  `,
})
export class ForgotPasswordPage {
  readonly Mail = Mail;
  readonly KeyRound = KeyRound;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    try {
      await this.auth.resetPassword(this.form.getRawValue().email);
      this.toast.success('Revisa tu bandeja de entrada');
      this.form.reset();
    } catch {
      this.toast.error('No pudimos enviar el email de recuperación');
    } finally {
      this.loading.set(false);
    }
  }
}
