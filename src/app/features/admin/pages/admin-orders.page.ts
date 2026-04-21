import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Package, Search, XCircle } from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../shared/models';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';
import {
  SortDirection,
  SortHeaderComponent,
} from '../../../shared/components/sort-header.component';

type SortKey = 'id' | 'userEmail' | 'items' | 'total' | 'status' | 'createdAt';

@Component({
  selector: 'fv-admin-orders-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    LucideAngularModule,
    CurrencyEurPipe,
    SortHeaderComponent,
  ],
  template: `
    <div class="space-y-5 fv-fade-in">
      <h2 class="text-xl sm:text-2xl font-bold text-white">Pedidos</h2>

      <div class="fv-glass rounded-2xl p-3 flex flex-col md:flex-row gap-3">
        <div class="relative flex-1 min-w-0">
          <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          <input
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Buscar por email o nº de pedido…"
            class="fv-input pl-9"
          />
          @if (search()) {
            <button type="button" (click)="search.set('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <lucide-icon [img]="XCircle" [size]="14"/>
            </button>
          }
        </div>
        <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="fv-input md:w-48">
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <!-- Desktop: tabla -->
      <div class="fv-card overflow-hidden hidden md:block">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-white/5 border-b border-white/10">
              <tr class="text-left text-slate-300">
                <th class="p-3"><fv-sort-header label="Nº" [direction]="dirFor('id')" (toggle)="setSort('id')"/></th>
                <th class="p-3"><fv-sort-header label="Cliente" [direction]="dirFor('userEmail')" (toggle)="setSort('userEmail')"/></th>
                <th class="p-3"><fv-sort-header label="Items" [direction]="dirFor('items')" (toggle)="setSort('items')"/></th>
                <th class="p-3"><fv-sort-header label="Total" [direction]="dirFor('total')" (toggle)="setSort('total')"/></th>
                <th class="p-3"><fv-sort-header label="Estado" [direction]="dirFor('status')" (toggle)="setSort('status')"/></th>
                <th class="p-3"><fv-sort-header label="Fecha" [direction]="dirFor('createdAt')" (toggle)="setSort('createdAt')"/></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (o of rows(); track o.id) {
                <tr class="hover:bg-white/5">
                  <td class="p-3 font-mono text-slate-300">#{{ o.id.slice(0, 6) }}</td>
                  <td class="p-3 text-white truncate max-w-[200px]">{{ o.userEmail }}</td>
                  <td class="p-3 text-slate-300">
                    <div class="flex items-center gap-1">
                      <lucide-icon [img]="Package" [size]="14"/>
                      {{ o.items.length }}
                    </div>
                  </td>
                  <td class="p-3 text-cyan-300 font-bold">{{ o.total | eur }}</td>
                  <td class="p-3">
                    <select
                      class="fv-input py-1.5 text-xs"
                      [value]="o.status"
                      (change)="onStatusChange(o, $event)"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td class="p-3 text-slate-400 text-xs whitespace-nowrap">
                    {{ formatDate(o.createdAt) }}
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="p-10 text-center text-slate-500">
                  {{ rawCount() === 0 ? 'Sin pedidos todavía.' : 'Ningún pedido coincide con los filtros.' }}
                </td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-4 py-2 text-xs text-slate-500 border-t border-white/5">
          {{ rows().length }} de {{ rawCount() }} pedido(s)
        </div>
      </div>

      <!-- Mobile: cards -->
      <div class="md:hidden space-y-3">
        @for (o of rows(); track o.id) {
          <article class="fv-card p-4">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="min-w-0">
                <p class="font-mono text-xs text-slate-500">#{{ o.id.slice(0, 6) }}</p>
                <p class="text-white font-medium truncate text-sm">{{ o.userEmail }}</p>
              </div>
              <span class="text-lg font-black fv-title shrink-0">{{ o.total | eur }}</span>
            </div>

            <div class="flex items-center gap-3 text-xs text-slate-400 mb-3">
              <span class="flex items-center gap-1"><lucide-icon [img]="Package" [size]="12"/> {{ o.items.length }} items</span>
              <span>{{ formatDate(o.createdAt) }}</span>
            </div>

            <select
              class="fv-input py-1.5 text-xs w-full"
              [value]="o.status"
              (change)="onStatusChange(o, $event)"
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </article>
        } @empty {
          <div class="fv-card p-8 text-center text-slate-500 text-sm">
            {{ rawCount() === 0 ? 'Sin pedidos todavía.' : 'Ningún pedido coincide con los filtros.' }}
          </div>
        }
        <p class="text-xs text-slate-500 text-center">{{ rows().length }} de {{ rawCount() }} pedido(s)</p>
      </div>
    </div>
  `,
})
export class AdminOrdersPage {
  readonly Package = Package;
  readonly Search = Search;
  readonly XCircle = XCircle;

  private readonly service = inject(OrderService);
  private readonly toast = inject(ToastService);

  readonly orders = toSignal(
    this.service.getAll().pipe(catchError(() => of<Order[]>([]))),
    { initialValue: [] as Order[] },
  );

  readonly search = signal('');
  readonly statusFilter = signal<OrderStatus | 'all'>('all');
  readonly sortKey = signal<SortKey | null>('createdAt');
  readonly sortDir = signal<SortDirection>('desc');

  readonly rawCount = computed(() => this.orders().length);

  readonly rows = computed<Order[]>(() => {
    const q = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    let items = this.orders().filter((o) => {
      if (st !== 'all' && o.status !== st) return false;
      if (!q) return true;
      return (
        o.userEmail.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.trackingCode ?? '').toLowerCase().includes(q)
      );
    });
    const key = this.sortKey();
    const dir = this.sortDir();
    if (key && dir) {
      const mul = dir === 'asc' ? 1 : -1;
      items = [...items].sort((a, b) => {
        const av = this.sortValue(a, key);
        const bv = this.sortValue(b, key);
        if (av < bv) return -1 * mul;
        if (av > bv) return 1 * mul;
        return 0;
      });
    }
    return items;
  });

  dirFor(key: SortKey): SortDirection {
    return this.sortKey() === key ? this.sortDir() : null;
  }

  setSort(key: SortKey): void {
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
      return;
    }
    const current = this.sortDir();
    if (current === 'asc') this.sortDir.set('desc');
    else if (current === 'desc') {
      this.sortKey.set(null);
      this.sortDir.set(null);
    } else this.sortDir.set('asc');
  }

  private sortValue(o: Order, key: SortKey): number | string {
    switch (key) {
      case 'items':
        return o.items.length;
      case 'total':
      case 'createdAt':
        return o[key];
      default:
        return o[key];
    }
  }

  async onStatusChange(order: Order, ev: Event): Promise<void> {
    const status = (ev.target as HTMLSelectElement).value as OrderStatus;
    if (status === order.status) return;
    try {
      await this.service.updateStatus(order.id, status);
      this.toast.success(`Pedido actualizado a ${status}`);
    } catch (err) {
      console.error(err);
      this.toast.error('No pudimos actualizar el pedido');
    }
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
