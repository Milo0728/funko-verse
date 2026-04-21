import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'fv-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="min-h-[70vh] flex items-center justify-center px-4">
      <div class="text-center fv-fade-in">
        <h1 class="text-[8rem] leading-none font-black fv-title" style="font-family: 'Orbitron', sans-serif">
          404
        </h1>
        <p class="text-slate-300 text-lg mb-6">
          Este portal dimensional no existe… todavía.
        </p>
        <a routerLink="/" class="fv-btn fv-btn-primary">Volver al inicio</a>
      </div>
    </section>
  `,
})
export class NotFoundPage {}
