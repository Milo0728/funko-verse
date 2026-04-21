import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Sparkles,
  Droplet,
  Flame,
  Wind,
  Mountain,
} from 'lucide-angular';

@Component({
  selector: 'fv-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <footer class="mt-24 border-t border-violet-500/10 bg-slate-950/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div class="grid md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center">
                <lucide-icon [img]="Sparkles" [size]="18" class="text-white" />
              </span>
              <span class="text-xl font-black" style="font-family: 'Orbitron', sans-serif">
                <span class="text-white">Funko</span>
                <span class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Verse</span>
              </span>
            </div>
            <p class="text-slate-400 max-w-sm text-sm">
              El universo Funko inspirado en los cuatro elementos. Coleccionables oficiales con estética anime moderna.
            </p>
          </div>

          <div>
            <h4 class="text-white font-semibold mb-3">Elementos</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/products" [queryParams]="{ tipo: 'agua' }" class="text-slate-400 hover:text-cyan-300 flex items-center gap-2"><lucide-icon [img]="Droplet" [size]="14"/>Agua</a></li>
              <li><a routerLink="/products" [queryParams]="{ tipo: 'fuego' }" class="text-slate-400 hover:text-orange-300 flex items-center gap-2"><lucide-icon [img]="Flame" [size]="14"/>Fuego</a></li>
              <li><a routerLink="/products" [queryParams]="{ tipo: 'aire' }" class="text-slate-400 hover:text-violet-300 flex items-center gap-2"><lucide-icon [img]="Wind" [size]="14"/>Aire</a></li>
              <li><a routerLink="/products" [queryParams]="{ tipo: 'tierra' }" class="text-slate-400 hover:text-emerald-300 flex items-center gap-2"><lucide-icon [img]="Mountain" [size]="14"/>Tierra</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-semibold mb-3">Tienda</h4>
            <ul class="space-y-2 text-sm text-slate-400">
              <li><a routerLink="/products" class="hover:text-white">Catálogo</a></li>
              <li><a routerLink="/cart" class="hover:text-white">Carrito</a></li>
              <li><a routerLink="/profile/orders" class="hover:text-white">Mis pedidos</a></li>
              <li><a routerLink="/wishlist" class="hover:text-white">Wishlist</a></li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {{ year }} FunkoVerse. Todos los derechos reservados.</span>
          <span>Hecho con Angular + Firebase • Desplegado en Vercel</span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly Sparkles = Sparkles;
  readonly Droplet = Droplet;
  readonly Flame = Flame;
  readonly Wind = Wind;
  readonly Mountain = Mountain;
  readonly year = new Date().getFullYear();
}
