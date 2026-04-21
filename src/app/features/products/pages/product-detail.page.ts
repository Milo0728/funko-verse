import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  Eye,
  Heart,
  ShoppingCart,
  Flame,
  Sparkles,
  ArrowLeft,
  Minus,
  Plus,
  Package,
} from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';
import { DiscountPipe } from '../../../shared/pipes/discount.pipe';
import { SpinnerComponent } from '../../../shared/components/spinner.component';
import { FunkoCardComponent } from '../../../shared/components/funko-card.component';
import { ELEMENTS, Funko } from '../../../shared/models';
import { SAMPLE_FUNKOS } from '../../../core/data/sample-funkos';

@Component({
  selector: 'fv-product-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucideAngularModule,
    CurrencyEurPipe,
    DiscountPipe,
    SpinnerComponent,
    FunkoCardComponent,
  ],
  template: `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <a routerLink="/products" class="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-5 sm:mb-6">
        <lucide-icon [img]="ArrowLeft" [size]="16"/> Volver al catálogo
      </a>

      @if (!funko()) {
        <fv-spinner minHeight="400px"/>
      } @else {
        <article class="grid md:grid-cols-2 gap-8 md:gap-10 fv-fade-in">
          <div class="relative">
            <div
              class="absolute -inset-4 rounded-[2rem] blur-2xl opacity-60 pointer-events-none"
              [style.background]="'radial-gradient(circle, ' + element().color + '55, transparent 70%)'"
            ></div>
            <div class="relative fv-card overflow-hidden aspect-square">
              <img
                [src]="funko()!.imagen_url"
                [alt]="funko()!.nombre"
                class="w-full h-full object-cover"
                (error)="onImgError($event)"
              />
              @if (funko()!.descuento) {
                <span
                  class="absolute top-4 left-4 px-3 py-1 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-lg"
                >
                  -{{ funko()!.descuento }}% OFF
                </span>
              }
            </div>
          </div>

          <div class="flex flex-col">
            <span class="fv-badge fv-badge-{{ funko()!.tipo }} w-fit">
              {{ element().label }}
            </span>

            <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-3 break-words">
              {{ funko()!.nombre }}
            </h1>

            <div class="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-sm text-slate-400">
              <span class="flex items-center gap-1">
                <lucide-icon [img]="Eye" [size]="14"/> {{ funko()!.vistas }} vistas
              </span>
              <span class="flex items-center gap-1">
                <lucide-icon [img]="Flame" [size]="14"/> Popularidad {{ funko()!.popularidad }}
              </span>
              <span class="flex items-center gap-1">
                <lucide-icon [img]="Package" [size]="14"/>
                @if (funko()!.stock > 0) {
                  <span class="text-emerald-300">{{ funko()!.stock }} en stock</span>
                } @else {
                  <span class="text-rose-300">Sin stock</span>
                }
              </span>
            </div>

            <p class="text-slate-300 mt-5 leading-relaxed">
              {{ funko()!.descripcion }}
            </p>

            <div class="mt-6 flex items-baseline gap-3 flex-wrap">
              @if (funko()!.descuento) {
                <span class="text-slate-500 line-through text-lg">
                  {{ funko()!.precio | eur }}
                </span>
                <span class="text-3xl sm:text-4xl font-black fv-title">
                  {{ (funko()!.precio | discount: funko()!.descuento) | eur }}
                </span>
              } @else {
                <span class="text-3xl sm:text-4xl font-black fv-title">
                  {{ funko()!.precio | eur }}
                </span>
              }
            </div>

            <div class="mt-6 sm:mt-8 flex flex-wrap gap-3 items-center">
              <div class="inline-flex items-center rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  (click)="decrease()"
                  class="p-3 text-slate-300 hover:text-white disabled:opacity-40"
                  [disabled]="quantity() <= 1"
                  aria-label="Menos"
                >
                  <lucide-icon [img]="Minus" [size]="14"/>
                </button>
                <span class="min-w-[44px] text-center font-semibold text-white">{{ quantity() }}</span>
                <button
                  type="button"
                  (click)="increase()"
                  class="p-3 text-slate-300 hover:text-white disabled:opacity-40"
                  [disabled]="quantity() >= funko()!.stock"
                  aria-label="Más"
                >
                  <lucide-icon [img]="Plus" [size]="14"/>
                </button>
              </div>

              <button
                type="button"
                class="fv-btn fv-btn-primary"
                (click)="addToCart()"
                [disabled]="funko()!.stock <= 0"
              >
                <lucide-icon [img]="ShoppingCart" [size]="16"/>
                Añadir al carrito
              </button>

              <button
                type="button"
                class="fv-btn fv-btn-ghost"
                (click)="toggleFavorite()"
              >
                <lucide-icon
                  [img]="Heart"
                  [size]="16"
                  [class]="isFavorite() ? 'text-rose-400 fill-rose-400' : ''"
                />
                {{ isFavorite() ? 'En tu wishlist' : 'Guardar' }}
              </button>
            </div>

            <div class="grid grid-cols-3 gap-3 mt-8">
              <div class="fv-glass rounded-xl p-3 text-center">
                <lucide-icon [img]="Sparkles" [size]="18" class="mx-auto text-violet-300 mb-1"/>
                <div class="text-[11px] sm:text-xs text-slate-400">Coleccionable oficial</div>
              </div>
              <div class="fv-glass rounded-xl p-3 text-center">
                <lucide-icon [img]="Package" [size]="18" class="mx-auto text-cyan-300 mb-1"/>
                <div class="text-[11px] sm:text-xs text-slate-400">Envío gratis +75€</div>
              </div>
              <div class="fv-glass rounded-xl p-3 text-center">
                <lucide-icon [img]="Heart" [size]="18" class="mx-auto text-rose-300 mb-1"/>
                <div class="text-[11px] sm:text-xs text-slate-400">Edición elemental</div>
              </div>
            </div>
          </div>
        </article>

        @if (related().length > 0) {
          <section class="mt-12 sm:mt-16">
            <h2 class="text-2xl font-black text-white mb-5" style="font-family: 'Orbitron', sans-serif">
              También te podría gustar
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              @for (f of related(); track f.id) {
                <fv-funko-card [funko]="f"/>
              }
            </div>
          </section>
        }
      }
    </section>
  `,
})
export class ProductDetailPage implements OnInit {
  readonly Eye = Eye;
  readonly Heart = Heart;
  readonly ShoppingCart = ShoppingCart;
  readonly Flame = Flame;
  readonly Sparkles = Sparkles;
  readonly ArrowLeft = ArrowLeft;
  readonly Minus = Minus;
  readonly Plus = Plus;
  readonly Package = Package;

  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly funko = signal<Funko | null>(null);
  readonly related = signal<Funko[]>([]);
  readonly quantity = signal<number>(1);

  private viewCounted = false;

  element = computed(() => ELEMENTS[this.funko()?.tipo ?? 'agua']);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pm) => {
        const id = pm.get('id');
        if (!id) return;
        this.viewCounted = false;
        this.funko.set(null);
        this.related.set([]);
        this.loadFunko(id);
      });
  }

  private loadFunko(id: string): void {
    this.productService
      .getById(id)
      .pipe(
        catchError(() => of(undefined)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((f) => {
        const found = f ?? SAMPLE_FUNKOS.find((s) => s.id === id) ?? null;
        if (!found) return;
        this.funko.set(found);
        this.loadRelated(found);
        // Solo contamos la vista una vez por navegación, no en cada update del stream.
        if (!this.viewCounted) {
          this.viewCounted = true;
          void this.trackView(found.id);
        }
      });
  }

  isFavorite(): boolean {
    const f = this.funko();
    return f ? this.wishlist.isFavorite(f.id) : false;
  }

  increase(): void {
    const max = this.funko()?.stock ?? 1;
    this.quantity.update((v) => Math.min(v + 1, max));
  }

  decrease(): void {
    this.quantity.update((v) => Math.max(1, v - 1));
  }

  addToCart(): void {
    const f = this.funko();
    if (!f) return;
    this.cart.add(f, this.quantity());
    this.toast.success(`${this.quantity()}× ${f.nombre} añadido al carrito`);
  }

  async toggleFavorite(): Promise<void> {
    const f = this.funko();
    if (!f) return;
    if (!this.auth.isLogged()) {
      this.toast.warn('Inicia sesión para usar la wishlist');
      return;
    }
    try {
      await this.wishlist.toggle(f.id);
    } catch (err) {
      this.toast.error((err as Error).message || 'No pudimos actualizar la wishlist');
    }
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%2316182d"/><text x="50%" y="50%" fill="%238b5cf6" font-family="sans-serif" font-size="26" text-anchor="middle" dominant-baseline="middle">FunkoVerse</text></svg>';
  }

  private loadRelated(source: Funko): void {
    this.productService
      .getRelated(source.tipo, source.id, 4)
      .pipe(
        catchError(() => of<Funko[]>([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        const list = items.length
          ? items
          : SAMPLE_FUNKOS.filter((s) => s.tipo === source.tipo && s.id !== source.id).slice(0, 4);
        this.related.set(list);
      });
  }

  private async trackView(id: string): Promise<void> {
    // Si el producto solo existe en samples, Firestore lanzará "not-found".
    // Lo silenciamos: no es un error que deba ver el usuario.
    try {
      await this.productService.incrementViews(id);
    } catch {
      /* ignore */
    }
  }
}
