import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, ShoppingCart, Eye } from 'lucide-angular';

import { Funko, ELEMENTS } from '../models';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyEurPipe } from '../pipes/currency-eur.pipe';
import { DiscountPipe } from '../pipes/discount.pipe';

@Component({
  selector: 'fv-funko-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, CurrencyEurPipe, DiscountPipe],
  template: `
    <article class="fv-card overflow-hidden relative group fv-fade-in">
      <!-- Favorito -->
      <button
        type="button"
        (click)="toggleFavorite()"
        class="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 hover:scale-110 transition"
        [attr.aria-label]="isFavorite() ? 'Quitar de favoritos' : 'Añadir a favoritos'"
      >
        <lucide-icon
          [img]="Heart"
          [size]="16"
          [class]="isFavorite() ? 'text-rose-400 fill-rose-400' : 'text-slate-300'"
        />
      </button>

      <!-- Descuento -->
      @if (funko().descuento) {
        <span
          class="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-lg"
        >
          -{{ funko().descuento }}%
        </span>
      }

      <a [routerLink]="['/products', funko().id]" class="block">
        <!-- Imagen con halo por elemento -->
        <div
          class="relative aspect-square overflow-hidden bg-gradient-to-br"
          [class]="'bg-gradient-to-br ' + element().gradient + '/20'"
        >
          <img
            [src]="funko().imagen_url"
            [alt]="funko().nombre"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            (error)="onImgError($event)"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"
          ></div>
        </div>

        <div class="p-4 flex flex-col gap-2">
          <span class="fv-badge fv-badge-{{ funko().tipo }}">
            {{ element().label }}
          </span>
          <h3 class="font-semibold text-white text-base line-clamp-1 mt-1">
            {{ funko().nombre }}
          </h3>
          <p class="text-slate-400 text-xs line-clamp-2">
            {{ funko().descripcion }}
          </p>

          <div class="flex items-center justify-between mt-2">
            <div class="flex items-baseline gap-2">
              @if (funko().descuento) {
                <span class="text-slate-500 line-through text-xs">
                  {{ funko().precio | eur }}
                </span>
                <span class="text-cyan-300 font-bold text-lg">
                  {{ (funko().precio | discount: funko().descuento) | eur }}
                </span>
              } @else {
                <span class="text-cyan-300 font-bold text-lg">
                  {{ funko().precio | eur }}
                </span>
              }
            </div>

            <div class="flex items-center gap-1 text-slate-500 text-xs">
              <lucide-icon [img]="Eye" [size]="12" />
              {{ funko().vistas }}
            </div>
          </div>
        </div>
      </a>

      <div class="px-4 pb-4">
        <button
          type="button"
          class="fv-btn fv-btn-primary w-full text-sm"
          (click)="addToCart()"
          [disabled]="funko().stock <= 0"
        >
          <lucide-icon [img]="ShoppingCart" [size]="16" />
          {{ funko().stock <= 0 ? 'Sin stock' : 'Añadir' }}
        </button>
      </div>
    </article>
  `,
})
export class FunkoCardComponent {
  readonly Heart = Heart;
  readonly ShoppingCart = ShoppingCart;
  readonly Eye = Eye;

  funko = input.required<Funko>();

  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  element() {
    return ELEMENTS[this.funko().tipo];
  }

  isFavorite(): boolean {
    return this.wishlist.isFavorite(this.funko().id);
  }

  addToCart(): void {
    this.cart.add(this.funko(), 1);
    this.toast.success(`${this.funko().nombre} añadido al carrito`);
  }

  async toggleFavorite(): Promise<void> {
    if (!this.auth.isLogged()) {
      this.toast.warn('Inicia sesión para usar tu wishlist');
      return;
    }
    try {
      await this.wishlist.toggle(this.funko().id);
    } catch (err) {
      this.toast.error((err as Error).message);
    }
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2316182d"/><text x="50%" y="50%" fill="%238b5cf6" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">FunkoVerse</text></svg>';
  }
}
