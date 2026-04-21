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

interface AdminNavItem {
  path: string;
  label: string;
  icon: 'dashboard' | 'products' | 'orders' | 'promotions';
  exact: boolean;
}

const ADMIN_NAV: readonly AdminNavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { path: '/admin/products', label: 'Productos', icon: 'products', exact: false },
  { path: '/admin/orders', label: 'Pedidos', icon: 'orders', exact: false },
  { path: '/admin/promotions', label: 'Promociones', icon: 'promotions', exact: false },
];

@Component({
  selector: 'fv-admin-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  template: `
    <section class="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <header class="mb-5 sm:mb-8 fv-fade-in">
        <a routerLink="/" class="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-3">
          <lucide-icon [img]="ArrowLeft" [size]="14"/> Volver a la tienda
        </a>
        <h1 class="text-3xl sm:text-4xl font-black fv-title" style="font-family: 'Orbitron', sans-serif">
          Panel de administración
        </h1>
        <p class="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">Gestiona tu universo FunkoVerse.</p>
      </header>

      <!-- Nav horizontal scrollable en mobile / sidebar en desktop -->
      <div class="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        <nav
          class="lg:h-fit lg:sticky lg:top-24 lg:p-2 lg:fv-card
                 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible
                 -mx-3 px-3 lg:mx-0 lg:px-0 pb-3 lg:pb-0 mb-4 lg:mb-0
                 border-b lg:border-b-0 border-white/5"
        >
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
              routerLinkActive="bg-white/10 text-white"
              class="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white whitespace-nowrap"
            >
              @switch (item.icon) {
                @case ('dashboard') { <lucide-icon [img]="LayoutDashboard" [size]="15"/> }
                @case ('products') { <lucide-icon [img]="Boxes" [size]="15"/> }
                @case ('orders') { <lucide-icon [img]="ClipboardList" [size]="15"/> }
                @case ('promotions') { <lucide-icon [img]="Tag" [size]="15"/> }
              }
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="min-w-0">
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
  readonly nav = ADMIN_NAV;
}
