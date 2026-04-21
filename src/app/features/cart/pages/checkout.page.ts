import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  CheckCircle2,
  CreditCard,
  MapPin,
  ClipboardList,
  Sparkles,
  ShoppingBag,
} from 'lucide-angular';

import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';
import { DiscountPipe } from '../../../shared/pipes/discount.pipe';
import { Order, OrderStatus, PaymentMethod } from '../../../shared/models';

type Step = 1 | 2 | 3 | 4;

@Component({
  selector: 'fv-checkout-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    CurrencyEurPipe,
    DiscountPipe,
  ],
  template: `
    <section class="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <header class="mb-8 fv-fade-in">
        <h1 class="text-4xl font-black fv-title" style="font-family: 'Orbitron', sans-serif">
          Checkout
        </h1>
        <p class="text-slate-400 mt-2">Finaliza tu pedido en 4 pasos.</p>
      </header>

      <!-- Stepper -->
      <div class="grid grid-cols-4 gap-2 mb-8">
        @for (s of steps; track s.n) {
          <div class="text-center">
            <div
              class="mx-auto w-10 h-10 rounded-full flex items-center justify-center border transition"
              [class]="step() >= s.n ? 'bg-gradient-to-br from-violet-500 to-cyan-400 border-transparent text-white' : 'border-white/10 text-slate-500'"
            >
              <lucide-icon [img]="s.icon" [size]="18"/>
            </div>
            <div class="text-[11px] mt-1 uppercase tracking-wider" [class]="step() >= s.n ? 'text-white' : 'text-slate-500'">
              {{ s.label }}
            </div>
          </div>
        }
      </div>

      @if (cart.summary().items.length === 0 && step() !== 4) {
        <div class="fv-card p-10 text-center">
          <p class="text-slate-300">Tu carrito está vacío.</p>
          <a routerLink="/products" class="fv-btn fv-btn-primary mt-4">Ir al catálogo</a>
        </div>
      } @else {
        <div class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 fv-card p-6 fv-fade-in">
            <!-- Paso 1: Resumen -->
            @if (step() === 1) {
              <h2 class="text-xl font-bold text-white mb-4">Resumen del pedido</h2>
              <ul class="divide-y divide-white/5">
                @for (it of cart.summary().items; track it.funko.id) {
                  <li class="py-3 flex items-center gap-4">
                    <img [src]="it.funko.imagen_url" class="w-14 h-14 rounded-lg object-cover"/>
                    <div class="flex-1">
                      <p class="text-white font-semibold text-sm">{{ it.funko.nombre }}</p>
                      <p class="text-slate-400 text-xs">x{{ it.cantidad }}</p>
                    </div>
                    <p class="text-cyan-300 font-bold">
                      {{ (it.funko.precio | discount: it.funko.descuento) * it.cantidad | eur }}
                    </p>
                  </li>
                }
              </ul>
              <button type="button" class="fv-btn fv-btn-primary w-full mt-6" (click)="next()">
                Continuar
              </button>
            }

            <!-- Paso 2: Dirección -->
            @if (step() === 2) {
              <h2 class="text-xl font-bold text-white mb-4">Dirección de envío</h2>
              <form [formGroup]="addressForm" class="grid sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="text-xs text-slate-400 mb-1 block">Nombre completo</label>
                  <input type="text" formControlName="fullName" class="fv-input"/>
                </div>
                <div class="sm:col-span-2">
                  <label class="text-xs text-slate-400 mb-1 block">Dirección</label>
                  <input type="text" formControlName="street" class="fv-input" placeholder="Calle, número, piso"/>
                </div>
                <div>
                  <label class="text-xs text-slate-400 mb-1 block">Ciudad</label>
                  <input type="text" formControlName="city" class="fv-input"/>
                </div>
                <div>
                  <label class="text-xs text-slate-400 mb-1 block">Provincia</label>
                  <input type="text" formControlName="state" class="fv-input"/>
                </div>
                <div>
                  <label class="text-xs text-slate-400 mb-1 block">Código postal</label>
                  <input type="text" formControlName="postalCode" class="fv-input"/>
                </div>
                <div>
                  <label class="text-xs text-slate-400 mb-1 block">País</label>
                  <input type="text" formControlName="country" class="fv-input"/>
                </div>
                <div class="sm:col-span-2">
                  <label class="text-xs text-slate-400 mb-1 block">Teléfono</label>
                  <input type="tel" formControlName="phone" class="fv-input"/>
                </div>
              </form>
              <div class="flex gap-3 mt-6">
                <button type="button" class="fv-btn fv-btn-ghost" (click)="prev()">Atrás</button>
                <button
                  type="button"
                  class="fv-btn fv-btn-primary flex-1"
                  [disabled]="addressForm.invalid"
                  (click)="next()"
                >Continuar</button>
              </div>
            }

            <!-- Paso 3: Pago -->
            @if (step() === 3) {
              <h2 class="text-xl font-bold text-white mb-4">Método de pago</h2>

              <div class="grid sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  (click)="setPayment('tarjeta')"
                  class="p-4 rounded-xl border transition text-left"
                  [class]="paymentMethod() === 'tarjeta' ? 'border-violet-400 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'"
                >
                  <lucide-icon [img]="CreditCard" [size]="20" class="text-violet-300 mb-2"/>
                  <div class="text-white font-semibold">Tarjeta</div>
                  <div class="text-xs text-slate-400">Visa / MasterCard</div>
                </button>
                <button
                  type="button"
                  (click)="setPayment('paypal')"
                  class="p-4 rounded-xl border transition text-left"
                  [class]="paymentMethod() === 'paypal' ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'"
                >
                  <div class="text-lg font-black text-cyan-300 mb-2">PayPal</div>
                  <div class="text-white font-semibold">PayPal</div>
                  <div class="text-xs text-slate-400">Pago seguro</div>
                </button>
              </div>

              @if (paymentMethod() === 'tarjeta') {
                <form [formGroup]="cardForm" class="grid sm:grid-cols-2 gap-4">
                  <div class="sm:col-span-2">
                    <label class="text-xs text-slate-400 mb-1 block">Número de tarjeta</label>
                    <input type="text" formControlName="number" maxlength="19" class="fv-input" placeholder="4242 4242 4242 4242"/>
                  </div>
                  <div>
                    <label class="text-xs text-slate-400 mb-1 block">Titular</label>
                    <input type="text" formControlName="holder" class="fv-input"/>
                  </div>
                  <div>
                    <label class="text-xs text-slate-400 mb-1 block">Vencimiento</label>
                    <input type="text" formControlName="expiry" maxlength="5" class="fv-input" placeholder="MM/AA"/>
                  </div>
                  <div>
                    <label class="text-xs text-slate-400 mb-1 block">CVC</label>
                    <input type="text" formControlName="cvc" maxlength="4" class="fv-input" placeholder="123"/>
                  </div>
                </form>
              } @else {
                <p class="text-slate-300 text-sm p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  Al confirmar te redirigiremos a PayPal (simulado) para autorizar el pago.
                </p>
              }

              <div class="flex gap-3 mt-6">
                <button type="button" class="fv-btn fv-btn-ghost" (click)="prev()">Atrás</button>
                <button
                  type="button"
                  class="fv-btn fv-btn-primary flex-1"
                  [disabled]="!canConfirm() || processing()"
                  (click)="confirm()"
                >
                  {{ processing() ? 'Procesando…' : 'Confirmar y pagar' }}
                </button>
              </div>
            }

            <!-- Paso 4: Confirmación -->
            @if (step() === 4) {
              <div class="text-center py-6 fv-fade-in">
                <div class="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                  <lucide-icon [img]="CheckCircle2" [size]="32" class="text-white"/>
                </div>
                <h2 class="text-2xl font-black text-white mb-2">¡Pedido confirmado!</h2>
                <p class="text-slate-400 mb-5">
                  Recibirás un correo con los detalles. Puedes seguir el estado en tu perfil.
                </p>
                @if (orderId()) {
                  <p class="text-sm text-slate-500 mb-6">
                    Nº de pedido: <span class="font-mono text-slate-300">{{ orderId() }}</span>
                  </p>
                }
                <div class="flex gap-3 justify-center">
                  <a routerLink="/profile/orders" class="fv-btn fv-btn-primary">
                    <lucide-icon [img]="ClipboardList" [size]="16"/>
                    Ver mis pedidos
                  </a>
                  <a routerLink="/products" class="fv-btn fv-btn-ghost">
                    <lucide-icon [img]="Sparkles" [size]="16"/>
                    Seguir comprando
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Resumen lateral -->
          <aside class="fv-card p-6 h-fit lg:sticky lg:top-24">
            <h3 class="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <lucide-icon [img]="ShoppingBag" [size]="18"/>
              Total
            </h3>
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
          </aside>
        </div>
      }
    </section>
  `,
})
export class CheckoutPage {
  readonly CheckCircle2 = CheckCircle2;
  readonly CreditCard = CreditCard;
  readonly MapPin = MapPin;
  readonly ClipboardList = ClipboardList;
  readonly Sparkles = Sparkles;
  readonly ShoppingBag = ShoppingBag;

  readonly steps = [
    { n: 1, icon: ClipboardList, label: 'Resumen' },
    { n: 2, icon: MapPin, label: 'Dirección' },
    { n: 3, icon: CreditCard, label: 'Pago' },
    { n: 4, icon: CheckCircle2, label: 'Confirmado' },
  ] as const;

  readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly step = signal<Step>(1);
  readonly paymentMethod = signal<PaymentMethod>('tarjeta');
  readonly processing = signal(false);
  readonly orderId = signal<string | null>(null);

  readonly addressForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['España', Validators.required],
    phone: [''],
  });

  readonly cardForm = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.minLength(12)]],
    holder: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvc: ['', [Validators.required, Validators.minLength(3)]],
  });

  readonly canConfirm = computed(() => {
    if (this.paymentMethod() === 'paypal') return true;
    return this.cardForm.valid;
  });

  next(): void {
    this.step.update((s) => (s < 4 ? ((s + 1) as Step) : s));
  }
  prev(): void {
    this.step.update((s) => (s > 1 ? ((s - 1) as Step) : s));
  }
  setPayment(m: PaymentMethod): void {
    this.paymentMethod.set(m);
  }

  async confirm(): Promise<void> {
    if (!this.auth.isLogged()) {
      this.toast.warn('Inicia sesión para completar el pedido');
      await this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }

    this.processing.set(true);
    try {
      // Simulamos latencia de la pasarela real.
      await new Promise((r) => setTimeout(r, 1200));

      const summary = this.cart.summary();
      const user = this.auth.firebaseUser()!;
      const appUser = this.auth.appUser();

      const now = Date.now();
      const order: Omit<Order, 'id'> = {
        userId: user.uid,
        userEmail: user.email ?? appUser?.email ?? '',
        items: summary.items,
        subtotal: summary.subtotal,
        discount: summary.discount,
        shipping: summary.shipping,
        total: summary.total,
        status: 'pagado' satisfies OrderStatus,
        paymentMethod: this.paymentMethod(),
        shippingAddress: this.addressForm.getRawValue(),
        createdAt: now,
        updatedAt: now,
        trackingCode: 'FV-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      };

      const id = await this.orders.createOrder(order);
      this.orderId.set(id);
      this.cart.clear();
      this.step.set(4);
      this.toast.success('¡Pago realizado con éxito!');
    } catch (err) {
      console.error(err);
      this.toast.error('No pudimos procesar el pago. Intenta de nuevo.');
    } finally {
      this.processing.set(false);
    }
  }
}
