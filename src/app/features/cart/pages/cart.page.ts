import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  CreditCard,
} from 'lucide-angular';

import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';
import { DiscountPipe } from '../../../shared/pipes/discount.pipe';
import { ELEMENTS } from '../../../shared/models';

@Component({
  selector: 'fv-cart-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, CurrencyEurPipe, DiscountPipe],
  template: `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <header class="mb-8 fv-fade-in">
        <h1 class="text-4xl font-black fv-title" style="font-family: 'Orbitron', sans-serif">
          Tu carrito
        </h1>
        <p class="text-slate-400 mt-2">{{ cart.summary().itemCount }} artículo(s)</p>
      </header>

      @if (cart.summary().items.length === 0) {
        <div class="fv-card p-12 text-center fv-fade-in">
          <lucide-icon [img]="ShoppingCart" [size]="48" class="mx-auto text-slate-500 mb-4"/>
          <h2 class="text-xl font-bold text-white mb-2">Aún no has añadido Funkos</h2>
          <p class="text-slate-400 mb-6">Explora el catálogo y empieza tu colección.</p>
          <a routerLink="/products" class="fv-btn fv-btn-primary">
            <lucide-icon [img]="Sparkles" [size]="16"/>
            Ir al catálogo
          </a>
        </div>
      } @else {
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Lista -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cart.summary().items; track item.funko.id) {
              <article class="fv-card p-4 flex flex-col sm:flex-row gap-4 fv-fade-in">
                <a
                  [routerLink]="['/products', item.funko.id]"
                  class="relative w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden"
                  [style.background]="'radial-gradient(circle, ' + color(item.funko.tipo) + '33, transparent 70%)'"
                >
                  <img [src]="item.funko.imagen_url" [alt]="item.funko.nombre" class="w-full h-full object-cover"/>
                </a>

                <div class="flex-1 flex flex-col">
                  <span class="fv-badge fv-badge-{{ item.funko.tipo }} w-fit">
                    {{ ELEMENTS[item.funko.tipo].label }}
                  </span>
                  <a [routerLink]="['/products', item.funko.id]" class="text-white font-semibold mt-2 hover:text-cyan-300">
                    {{ item.funko.nombre }}
                  </a>
                  <div class="mt-1 flex items-baseline gap-2">
                    @if (item.funko.descuento) {
                      <span class="text-slate-500 line-through text-xs">{{ item.funko.precio | eur }}</span>
                      <span class="text-cyan-300 font-bold">
                        {{ (item.funko.precio | discount: item.funko.descuento) | eur }}
                      </span>
                    } @else {
                      <span class="text-cyan-300 font-bold">{{ item.funko.precio | eur }}</span>
                    }
                  </div>

                  <div class="mt-3 flex items-center justify-between gap-3">
                    <div class="inline-flex items-center rounded-lg border border-white/10 bg-white/5">
                      <button
                        type="button"
                        class="p-2 text-slate-300 hover:text-white"
                        (click)="dec(item.funko.id, item.cantidad)"
                        aria-label="Menos"
                      >
                        <lucide-icon [img]="Minus" [size]="14"/>
                      </button>
                      <span class="min-w-[32px] text-center text-white font-semibold">{{ item.cantidad }}</span>
                      <button
                        type="button"
                        class="p-2 text-slate-300 hover:text-white"
                        (click)="inc(item.funko.id, item.cantidad, item.funko.stock)"
                        [disabled]="item.cantidad >= item.funko.stock"
                        aria-label="Más"
                      >
                        <lucide-icon [img]="Plus" [size]="14"/>
                      </button>
                    </div>
                    <button
                      type="button"
                      class="text-sm text-rose-300 hover:text-rose-200 flex items-center gap-1"
                      (click)="remove(item.funko.id, item.funko.nombre)"
                    >
                      <lucide-icon [img]="Trash2" [size]="14"/> Eliminar
                    </button>
                  </div>
                </div>
              </article>
            }

            <button
              type="button"
              class="text-sm text-slate-400 hover:text-rose-300"
              (click)="clearAll()"
            >
              Vaciar carrito
            </button>
          </div>

          <!-- Resumen -->
          <aside class="fv-card p-6 h-fit lg:sticky lg:top-24 fv-fade-in">
            <h3 class="text-white font-bold text-lg mb-4">Resumen</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{{ cart.summary().subtotal | eur }}</span>
              </div>
              @if (cart.summary().discount > 0) {
                <div class="flex justify-between text-emerald-300">
                  <span>Descuento</span>
                  <span>−{{ cart.summary().discount | eur }}</span>
                </div>
              }
              <div class="flex justify-between text-slate-300">
                <span>Envío</span>
                <span>
                  @if (cart.summary().shipping === 0) {
                    <span class="text-emerald-300">Gratis</span>
                  } @else {
                    {{ cart.summary().shipping | eur }}
                  }
                </span>
              </div>
              <div class="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span class="text-white font-semibold">Total</span>
                <span class="text-2xl font-black fv-title">{{ cart.summary().total | eur }}</span>
              </div>
            </div>

            <a routerLink="/checkout" class="fv-btn fv-btn-primary w-full mt-5">
              <lucide-icon [img]="CreditCard" [size]="16"/> Pagar
            </a>
            <p class="text-xs text-slate-500 mt-3 text-center">
              Envío gratis en pedidos desde 75€
            </p>
          </aside>
        </div>
      }
    </section>
  `,
})
export class CartPage {
  readonly Trash2 = Trash2;
  readonly Minus = Minus;
  readonly Plus = Plus;
  readonly ShoppingCart = ShoppingCart;
  readonly Sparkles = Sparkles;
  readonly CreditCard = CreditCard;
  readonly ELEMENTS = ELEMENTS;

  readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  color(tipo: keyof typeof ELEMENTS): string {
    return ELEMENTS[tipo].color;
  }

  inc(id: string, current: number, stock: number): void {
    if (current >= stock) return;
    this.cart.updateQuantity(id, current + 1);
  }

  dec(id: string, current: number): void {
    this.cart.updateQuantity(id, current - 1);
  }

  remove(id: string, name: string): void {
    this.cart.remove(id);
    this.toast.info(`${name} eliminado`);
  }

  async clearAll(): Promise<void> {
    const ok = await this.toast.confirm('¿Vaciar carrito?', 'Esta acción no se puede deshacer');
    if (!ok) return;
    this.cart.clear();
    this.toast.success('Carrito vacío');
  }
}
