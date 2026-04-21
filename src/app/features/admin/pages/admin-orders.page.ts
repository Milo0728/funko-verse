import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Package } from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../shared/models';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';

@Component({
  selector: 'fv-admin-orders-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, CurrencyEurPipe],
  template: `
    <div class="space-y-6 fv-fade-in">
      <h2 class="text-2xl font-bold text-white">Pedidos</h2>

      <div class="fv-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-white/5 border-b border-white/10">
              <tr class="text-left">
                <th class="p-3 text-slate-300">Nº</th>
                <th class="p-3 text-slate-300">Cliente</th>
                <th class="p-3 text-slate-300">Items</th>
                <th class="p-3 text-slate-300">Total</th>
                <th class="p-3 text-slate-300">Estado</th>
                <th class="p-3 text-slate-300">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (o of orders(); track o.id) {
                <tr class="hover:bg-white/5">
                  <td class="p-3 font-mono text-slate-300">#{{ o.id.slice(0, 6) }}</td>
                  <td class="p-3 text-white">{{ o.userEmail }}</td>
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
                  <td class="p-3 text-slate-400 text-xs">
                    {{ formatDate(o.createdAt) }}
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="p-10 text-center text-slate-500">Sin pedidos todavía.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminOrdersPage {
  readonly Package = Package;

  private readonly service = inject(OrderService);
  private readonly toast = inject(ToastService);

  readonly orders = toSignal(
    this.service.getAll().pipe(catchError(() => of<Order[]>([]))),
    { initialValue: [] as Order[] },
  );

  async onStatusChange(order: Order, ev: Event): Promise<void> {
    const status = (ev.target as HTMLSelectElement).value as OrderStatus;
    try {
      await this.service.updateStatus(order.id, status);
      this.toast.success(`Pedido actualizado a ${status}`);
    } catch {
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
