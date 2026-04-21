import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  XCircle,
} from 'lucide-angular';
import { catchError, of, switchMap } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../shared/models';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';

@Component({
  selector: 'fv-my-orders-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, CurrencyEurPipe],
  template: `
    <section class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header class="mb-6 sm:mb-8 fv-fade-in">
        <h1 class="text-3xl sm:text-4xl font-black fv-title" style="font-family: 'Orbitron', sans-serif">Mis pedidos</h1>
        <p class="text-slate-400 mt-2 text-sm sm:text-base">Consulta el estado de tus compras.</p>
      </header>

      @if (orders() == null) {
        <div class="fv-card p-10 text-center text-slate-400">Cargando…</div>
      } @else if (orders()!.length === 0) {
        <div class="fv-card p-8 sm:p-10 text-center">
          <lucide-icon [img]="Package" [size]="40" class="mx-auto text-slate-500 mb-3"/>
          <p class="text-slate-300">Aún no has hecho ningún pedido.</p>
          <a routerLink="/products" class="fv-btn fv-btn-primary mt-4">Explorar catálogo</a>
        </div>
      } @else {
        <ul class="space-y-4">
          @for (o of orders(); track o.id) {
            <li class="fv-card p-4 sm:p-5 fv-fade-in">
              <div class="flex flex-wrap justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase tracking-wider text-slate-500">Pedido</p>
                  <p class="font-mono text-slate-200 text-sm">#{{ o.id.slice(0, 8) }}</p>
                  <p class="text-slate-500 text-xs mt-1">{{ formatDate(o.createdAt) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [img]="iconFor(o.status)" [size]="16" [class]="colorFor(o.status)"/>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold" [class]="badgeClass(o.status)">
                    {{ statusLabel(o.status) }}
                  </span>
                </div>
              </div>

              <ul class="grid sm:grid-cols-2 gap-2 mb-4">
                @for (it of o.items; track it.funko.id) {
                  <li class="flex items-center gap-3 min-w-0">
                    <img [src]="it.funko.imagen_url" class="w-10 h-10 rounded-lg object-cover shrink-0"/>
                    <div class="text-sm min-w-0">
                      <p class="text-white truncate">{{ it.funko.nombre }}</p>
                      <p class="text-slate-500 text-xs">x{{ it.cantidad }}</p>
                    </div>
                  </li>
                }
              </ul>

              <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5">
                <p class="text-xs text-slate-500">
                  {{ o.items.length }} producto(s) · {{ methodLabel(o.paymentMethod) }}
                  @if (o.trackingCode) {
                    · Tracking <span class="font-mono">{{ o.trackingCode }}</span>
                  }
                </p>
                <span class="text-lg font-black fv-title">{{ o.total | eur }}</span>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class MyOrdersPage {
  readonly Package = Package;

  private readonly auth = inject(AuthService);
  private readonly ordersService = inject(OrderService);

  readonly orders = toSignal<Order[] | null>(
    toObservable(this.auth.firebaseUser).pipe(
      switchMap((u) =>
        u
          ? this.ordersService.getByUser(u.uid).pipe(catchError(() => of<Order[]>([])))
          : of<Order[]>([]),
      ),
    ),
    { initialValue: null },
  );

  statusLabel(s: OrderStatus): string {
    return {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    }[s];
  }

  badgeClass(s: OrderStatus): string {
    switch (s) {
      case 'pendiente':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'pagado':
        return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
      case 'enviado':
        return 'bg-violet-500/15 text-violet-300 border border-violet-500/30';
      case 'entregado':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
    }
  }

  iconFor(s: OrderStatus) {
    switch (s) {
      case 'pendiente': return Clock;
      case 'pagado': return CreditCard;
      case 'enviado': return Truck;
      case 'entregado': return CheckCircle2;
      default: return XCircle;
    }
  }

  colorFor(s: OrderStatus): string {
    switch (s) {
      case 'pendiente': return 'text-amber-300';
      case 'pagado': return 'text-cyan-300';
      case 'enviado': return 'text-violet-300';
      case 'entregado': return 'text-emerald-300';
      default: return 'text-rose-300';
    }
  }

  methodLabel(m: string): string {
    return m === 'tarjeta' ? 'Tarjeta' : 'PayPal';
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
