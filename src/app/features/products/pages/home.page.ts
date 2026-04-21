import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  Droplet,
  Flame,
  Wind,
  Mountain,
  ArrowRight,
  Sparkles,
  Star,
} from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { FunkoCardComponent } from '../../../shared/components/funko-card.component';
import { SkeletonCardComponent } from '../../../shared/components/skeleton-card.component';
import { ELEMENT_LIST, Funko } from '../../../shared/models';
import { SAMPLE_FUNKOS } from '../../../core/data/sample-funkos';

@Component({
  selector: 'fv-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucideAngularModule,
    FunkoCardComponent,
    SkeletonCardComponent,
  ],
  template: `
    <!-- HERO -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-10 left-10 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl fv-float"></div>
        <div class="absolute top-40 right-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl fv-float" style="animation-delay: 1s"></div>
        <div class="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl fv-float" style="animation-delay: 2s"></div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div class="fv-fade-in">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-5">
            <lucide-icon [img]="Sparkles" [size]="14"/>
            Colección elemental 2026
          </span>

          <h1 class="text-5xl md:text-7xl font-black leading-[0.95] mb-6 fv-title" style="font-family: 'Orbitron', sans-serif">
            Domina los<br/>4 elementos.
          </h1>
          <p class="text-lg text-slate-400 mb-8 max-w-xl">
            FunkoVerse reúne los Funkos más icónicos inspirados en <strong class="text-cyan-300">agua</strong>,
            <strong class="text-orange-300">fuego</strong>,
            <strong class="text-violet-300">aire</strong> y
            <strong class="text-emerald-300">tierra</strong>. Coleccionables con alma otaku.
          </p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/products" class="fv-btn fv-btn-primary">
              Explorar catálogo
              <lucide-icon [img]="ArrowRight" [size]="18"/>
            </a>
            <a routerLink="/products" [queryParams]="{ sort: 'nuevos' }" class="fv-btn fv-btn-ghost">
              Ver novedades
            </a>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/5">
            <div>
              <div class="text-2xl font-black text-white">{{ totalFunkos() }}+</div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Funkos</div>
            </div>
            <div>
              <div class="text-2xl font-black text-white">4</div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Elementos</div>
            </div>
            <div>
              <div class="text-2xl font-black text-white">24/7</div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Envíos</div>
            </div>
          </div>
        </div>

        <!-- Card decorativa -->
        <div class="relative fv-fade-in">
          <div class="relative mx-auto max-w-md">
            <div class="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 blur-2xl opacity-40 rounded-[3rem]"></div>
            <div class="relative fv-card p-8 fv-float">
              <div class="grid grid-cols-2 gap-4">
                @for (el of elements; track el.key) {
                  <a
                    [routerLink]="['/products']"
                    [queryParams]="{ tipo: el.key }"
                    class="group relative aspect-square rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 border border-white/5 transition hover:scale-105"
                    [style.background]="'radial-gradient(circle at 30% 20%, ' + el.color + '33, transparent 70%)'"
                  >
                    <lucide-icon
                      [img]="iconFor(el.key)"
                      [size]="40"
                      [style.color]="el.color"
                      class="group-hover:scale-110 transition-transform"
                    />
                    <span class="text-white font-bold">{{ el.label }}</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sección elementos -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div class="flex items-baseline justify-between mb-6">
        <h2 class="text-3xl font-black text-white" style="font-family: 'Orbitron', sans-serif">Elige tu elemento</h2>
        <a routerLink="/products" class="text-sm text-violet-300 hover:text-violet-200 flex items-center gap-1">
          Ver todo <lucide-icon [img]="ArrowRight" [size]="14"/>
        </a>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (el of elements; track el.key) {
          <a
            [routerLink]="['/products']"
            [queryParams]="{ tipo: el.key }"
            class="relative group overflow-hidden rounded-2xl p-6 border border-white/5 transition hover:border-white/20"
            [style.background]="'linear-gradient(135deg, ' + el.color + '22, transparent)'"
          >
            <lucide-icon
              [img]="iconFor(el.key)"
              [size]="40"
              [style.color]="el.color"
              class="mb-3 group-hover:scale-110 transition-transform"
            />
            <h3 class="text-xl font-bold text-white mb-1">{{ el.label }}</h3>
            <p class="text-slate-400 text-xs">
              Ver colección {{ el.label.toLowerCase() }}
            </p>
          </a>
        }
      </div>
    </section>

    <!-- Destacados -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div class="flex items-baseline justify-between mb-6">
        <div>
          <h2 class="text-3xl font-black text-white flex items-center gap-2" style="font-family: 'Orbitron', sans-serif">
            <lucide-icon [img]="Star" [size]="26" class="text-amber-400"/>
            Destacados
          </h2>
          <p class="text-slate-400 text-sm mt-1">Los más queridos por la comunidad FunkoVerse</p>
        </div>
        <a routerLink="/products" [queryParams]="{ sort: 'popularidad' }" class="text-sm text-violet-300 hover:text-violet-200 flex items-center gap-1">
          Ver top <lucide-icon [img]="ArrowRight" [size]="14"/>
        </a>
      </div>

      @if (loading()) {
        <fv-skeleton-card [count]="4" gridClass="grid-cols-2 md:grid-cols-4"/>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
          @for (f of featured(); track f.id) {
            <fv-funko-card [funko]="f" />
          }
        </div>
      }
    </section>
  `,
})
export class HomePage {
  readonly Droplet = Droplet;
  readonly Flame = Flame;
  readonly Wind = Wind;
  readonly Mountain = Mountain;
  readonly ArrowRight = ArrowRight;
  readonly Sparkles = Sparkles;
  readonly Star = Star;
  readonly elements = ELEMENT_LIST;

  private readonly productService = inject(ProductService);

  readonly loading = signal<boolean>(true);

  // Si Firebase aún no está configurado, caemos a los samples para que la UI no se vea vacía.
  private readonly products = toSignal<Funko[] | undefined>(
    this.productService.getAll().pipe(
      catchError(() => of<Funko[]>(SAMPLE_FUNKOS)),
    ),
    { initialValue: undefined },
  );

  readonly featured = signal<Funko[]>([]);
  readonly totalFunkos = signal<number>(SAMPLE_FUNKOS.length);

  constructor() {
    // Refleja cambios del stream en los signals renderizados.
    queueMicrotask(() => this.syncProducts());
  }

  private syncProducts(): void {
    const data = this.products();
    if (data == null) {
      // cargando inicial
      setTimeout(() => this.syncProducts(), 200);
      return;
    }
    const source = data.length > 0 ? data : SAMPLE_FUNKOS;
    const top = [...source]
      .sort((a, b) => (b.popularidad ?? 0) - (a.popularidad ?? 0))
      .slice(0, 4);
    this.featured.set(top);
    this.totalFunkos.set(source.length);
    this.loading.set(false);
  }

  iconFor(key: string) {
    switch (key) {
      case 'agua': return this.Droplet;
      case 'fuego': return this.Flame;
      case 'aire': return this.Wind;
      default: return this.Mountain;
    }
  }
}
