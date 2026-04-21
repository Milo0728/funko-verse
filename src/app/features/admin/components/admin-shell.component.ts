import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Tag,
  ArrowLeft,
} from 'lucide-angular';

@Component({
  selector: 'fv-admin-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  template: `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <header class="mb-8 fv-fade-in">
        <a routerLink="/" class="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-3">
          <lucide-icon [img]="ArrowLeft" [size]="14"/> Volver a la tienda
        </a>
        <h1 class="text-4xl font-black fv-title" style="font-family: 'Orbitron', sans-serif">
          Panel de administración
        </h1>
        <p class="text-slate-400 mt-2">Gestiona tu universo FunkoVerse.</p>
      </header>

      <div class="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside class="fv-card p-4 h-fit space-y-1">
          <a
            routerLink="/admin"
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="bg-white/10 text-white"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <lucide-icon [img]="LayoutDashboard" [size]="15"/> Dashboard
          </a>
          <a
            routerLink="/admin/products"
            routerLinkActive="bg-white/10 text-white"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <lucide-icon [img]="Boxes" [size]="15"/> Productos
          </a>
          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-white/10 text-white"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <lucide-icon [img]="ClipboardList" [size]="15"/> Pedidos
          </a>
          <a
            routerLink="/admin/promotions"
            routerLinkActive="bg-white/10 text-white"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <lucide-icon [img]="Tag" [size]="15"/> Promociones
          </a>
        </aside>

        <div>
          <router-outlet/>
        </div>
      </div>
    </section>
  `,
})
export class AdminShellComponent {
  readonly LayoutDashboard = LayoutDashboard;
  readonly Boxes = Boxes;
  readonly ClipboardList = ClipboardList;
  readonly Tag = Tag;
  readonly ArrowLeft = ArrowLeft;
}
