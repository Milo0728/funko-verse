import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './navbar.component';
import { FooterComponent } from './footer.component';

/** Contenedor principal de la aplicación (layout público). */
@Component({
  selector: 'fv-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col relative z-10">
      <fv-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <fv-footer />
    </div>
  `,
})
export class ShellComponent {}
