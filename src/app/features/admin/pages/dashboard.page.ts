import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, DollarSign, ShoppingBag, Users, Eye, TrendingUp, Flame } from 'lucide-angular';
import { catchError, of } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { UserService } from '../../../core/services/user.service';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';
import { ELEMENTS, Funko, Order } from '../../../shared/models';
import { SAMPLE_FUNKOS } from '../../../core/data/sample-funkos';

@Component({
  selector: 'fv-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, CurrencyEurPipe, BaseChartDirective],
  template: `
    <div class="space-y-6 fv-fade-in">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="fv-card p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 uppercase tracking-wider">Ventas totales</span>
            <lucide-icon [img]="DollarSign" [size]="18" class="text-emerald-300"/>
          </div>
          <div class="text-3xl font-black text-white mt-2">{{ totalSales() | eur }}</div>
        </div>
        <div class="fv-card p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 uppercase tracking-wider">Pedidos</span>
            <lucide-icon [img]="ShoppingBag" [size]="18" class="text-cyan-300"/>
          </div>
          <div class="text-3xl font-black text-white mt-2">{{ totalOrders() }}</div>
        </div>
        <div class="fv-card p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 uppercase tracking-wider">Usuarios</span>
            <lucide-icon [img]="Users" [size]="18" class="text-violet-300"/>
          </div>
          <div class="text-3xl font-black text-white mt-2">{{ totalUsers() }}</div>
        </div>
        <div class="fv-card p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 uppercase tracking-wider">Vistas totales</span>
            <lucide-icon [img]="Eye" [size]="18" class="text-amber-300"/>
          </div>
          <div class="text-3xl font-black text-white mt-2">{{ totalViews() }}</div>
        </div>
      </div>

      <div class="grid lg:grid-cols-5 gap-6">
        <div class="lg:col-span-3 fv-card p-5">
          <h3 class="text-white font-bold mb-4 flex items-center gap-2">
            <lucide-icon [img]="TrendingUp" [size]="18"/> Ventas por elemento
          </h3>
          <canvas
            baseChart
            [data]="salesChart()"
            [options]="chartOptions"
            type="doughnut"
            style="max-height: 280px"
          ></canvas>
        </div>

        <div class="lg:col-span-2 fv-card p-5">
          <h3 class="text-white font-bold mb-4 flex items-center gap-2">
            <lucide-icon [img]="Flame" [size]="18" class="text-orange-300"/> Top populares
          </h3>
          <ul class="space-y-3">
            @for (p of topProducts(); track p.id) {
              <li class="flex items-center gap-3">
                <img [src]="p.imagen_url" class="w-10 h-10 rounded-lg object-cover"/>
                <div class="flex-1 min-w-0">
                  <p class="text-white text-sm truncate">{{ p.nombre }}</p>
                  <p class="text-slate-500 text-xs">{{ ELEMENTS[p.tipo].label }}</p>
                </div>
                <span class="text-xs font-bold text-cyan-300">{{ p.popularidad }}</span>
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="fv-card p-5">
        <h3 class="text-white font-bold mb-4 flex items-center gap-2">
          <lucide-icon [img]="Eye" [size]="18" class="text-amber-300"/> Más vistos
        </h3>
        <ul class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          @for (p of mostViewed(); track p.id) {
            <li class="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <img [src]="p.imagen_url" class="w-12 h-12 rounded-lg object-cover"/>
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm truncate">{{ p.nombre }}</p>
                <p class="text-slate-400 text-xs flex items-center gap-1">
                  <lucide-icon [img]="Eye" [size]="12"/> {{ p.vistas }} vistas
                </p>
              </div>
            </li>
          }
        </ul>
      </div>
    </div>
  `,
})
export class AdminDashboardPage {
  readonly DollarSign = DollarSign;
  readonly ShoppingBag = ShoppingBag;
  readonly Users = Users;
  readonly Eye = Eye;
  readonly TrendingUp = TrendingUp;
  readonly Flame = Flame;
  readonly ELEMENTS = ELEMENTS;

  private readonly orders = inject(OrderService);
  private readonly products = inject(ProductService);
  private readonly users = inject(UserService);

  private readonly ordersStream = toSignal(
    this.orders.getAll().pipe(catchError(() => of<Order[]>([]))),
    { initialValue: [] as Order[] },
  );

  private readonly productsStream = toSignal(
    this.products.getAll().pipe(catchError(() => of<Funko[]>(SAMPLE_FUNKOS))),
    { initialValue: SAMPLE_FUNKOS },
  );

  private readonly usersStream = toSignal(
    this.users.getAll().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  readonly totalSales = computed(() =>
    this.ordersStream().reduce((acc, o) => acc + (o.total ?? 0), 0),
  );
  readonly totalOrders = computed(() => this.ordersStream().length);
  readonly totalUsers = computed(() => this.usersStream().length);
  readonly totalViews = computed(() =>
    this.productsStream().reduce((acc, p) => acc + (p.vistas ?? 0), 0),
  );

  readonly topProducts = computed(() =>
    [...this.productsStream()]
      .sort((a, b) => (b.popularidad ?? 0) - (a.popularidad ?? 0))
      .slice(0, 5),
  );
  readonly mostViewed = computed(() =>
    [...this.productsStream()]
      .sort((a, b) => (b.vistas ?? 0) - (a.vistas ?? 0))
      .slice(0, 6),
  );

  readonly salesChart = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const byElement: Record<string, number> = { agua: 0, fuego: 0, aire: 0, tierra: 0 };
    for (const o of this.ordersStream()) {
      for (const it of o.items) {
        const key = it.funko.tipo;
        byElement[key] = (byElement[key] ?? 0) + it.funko.precio * it.cantidad;
      }
    }
    // Si no hay órdenes aún, mostramos una distribución simulada por popularidad.
    const hasData = Object.values(byElement).some((v) => v > 0);
    if (!hasData) {
      for (const p of this.productsStream()) {
        byElement[p.tipo] = (byElement[p.tipo] ?? 0) + (p.popularidad ?? 0);
      }
    }
    return {
      labels: ['Agua', 'Fuego', 'Aire', 'Tierra'],
      datasets: [
        {
          data: [byElement['agua'], byElement['fuego'], byElement['aire'], byElement['tierra']],
          backgroundColor: ['#22d3ee', '#f97316', '#a78bfa', '#10b981'],
          borderColor: '#0b0c1a',
          borderWidth: 3,
        },
      ],
    };
  });

  readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#cbd5e1', font: { size: 13 } },
      },
    },
  };
}
