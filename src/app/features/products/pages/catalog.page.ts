import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, XCircle } from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { FunkoCardComponent } from '../../../shared/components/funko-card.component';
import { SkeletonCardComponent } from '../../../shared/components/skeleton-card.component';
import {
  ELEMENT_LIST,
  ElementType,
  Funko,
  SortOption,
} from '../../../shared/models';
import { SAMPLE_FUNKOS } from '../../../core/data/sample-funkos';

@Component({
  selector: 'fv-catalog-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    LucideAngularModule,
    FunkoCardComponent,
    SkeletonCardComponent,
  ],
  template: `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <header class="mb-8 fv-fade-in">
        <h1 class="text-4xl md:text-5xl font-black fv-title" style="font-family: 'Orbitron', sans-serif">
          Catálogo
        </h1>
        <p class="text-slate-400 mt-2">Explora el universo de Funkos por elemento.</p>
      </header>

      <!-- Filtros -->
      <div class="fv-glass rounded-2xl p-4 mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <!-- Search -->
        <div class="relative flex-1">
          <lucide-icon
            [img]="Search"
            [size]="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            [ngModel]="search()"
            (ngModelChange)="onSearch($event)"
            placeholder="Buscar un Funko…"
            class="fv-input pl-10"
          />
          @if (search()) {
            <button
              type="button"
              (click)="onSearch('')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              aria-label="Limpiar"
            >
              <lucide-icon [img]="XCircle" [size]="16"/>
            </button>
          }
        </div>

        <!-- Elementos -->
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            (click)="setElement('all')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
            [class]="element() === 'all' ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'"
          >
            Todos
          </button>
          @for (el of elements; track el.key) {
            <button
              type="button"
              (click)="setElement(el.key)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5"
              [class]="element() === el.key ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'"
            >
              <span class="w-2 h-2 rounded-full" [style.background]="el.color"></span>
              {{ el.label }}
            </button>
          }
        </div>

        <!-- Sort -->
        <div class="flex items-center gap-2">
          <lucide-icon [img]="Filter" [size]="16" class="text-slate-400"/>
          <select
            [ngModel]="sort()"
            (ngModelChange)="setSort($event)"
            class="fv-input py-2"
          >
            <option value="popularidad">Más populares</option>
            <option value="nuevos">Nuevos primero</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      <!-- Grid -->
      @if (loading()) {
        <fv-skeleton-card [count]="8"/>
      } @else if (filtered().length === 0) {
        <div class="text-center py-20 fv-fade-in">
          <p class="text-slate-400">No encontramos Funkos con esos filtros.</p>
          <button type="button" (click)="resetFilters()" class="fv-btn fv-btn-ghost mt-4">
            Limpiar filtros
          </button>
        </div>
      } @else {
        <p class="text-sm text-slate-500 mb-4">
          {{ filtered().length }} resultado(s)
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (f of filtered(); track f.id) {
            <fv-funko-card [funko]="f"/>
          }
        </div>
      }
    </section>
  `,
})
export class CatalogPage {
  readonly Search = Search;
  readonly Filter = Filter;
  readonly XCircle = XCircle;
  readonly elements = ELEMENT_LIST;

  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly search = signal('');
  readonly element = signal<ElementType | 'all'>('all');
  readonly sort = signal<SortOption>('popularidad');

  private readonly productsStream = toSignal<Funko[] | undefined>(
    this.productService.getAll().pipe(catchError(() => of<Funko[]>(SAMPLE_FUNKOS))),
    { initialValue: undefined },
  );

  readonly products = computed<Funko[]>(() => {
    const data = this.productsStream();
    if (data === undefined) return [];
    const base = data.length > 0 ? data : SAMPLE_FUNKOS;
    return base;
  });

  readonly filtered = computed<Funko[]>(() => {
    let items = this.products();
    const q = this.search().trim().toLowerCase();
    if (q) items = items.filter((f) => f.nombre.toLowerCase().includes(q));
    if (this.element() !== 'all') items = items.filter((f) => f.tipo === this.element());
    switch (this.sort()) {
      case 'precio_asc':
        items = [...items].sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        items = [...items].sort((a, b) => b.precio - a.precio);
        break;
      case 'nuevos':
        items = [...items].sort((a, b) => b.fecha_creacion - a.fecha_creacion);
        break;
      case 'popularidad':
      default:
        items = [...items].sort((a, b) => (b.popularidad ?? 0) - (a.popularidad ?? 0));
    }
    return items;
  });

  constructor() {
    // Lee filtros de query params al montar y cuando cambien
    this.route.queryParamMap.subscribe((pm) => {
      const tipo = pm.get('tipo') as ElementType | null;
      const sort = pm.get('sort') as SortOption | null;
      const q = pm.get('q');
      if (tipo) this.element.set(tipo);
      else this.element.set('all');
      if (sort) this.sort.set(sort);
      if (q) this.search.set(q);
    });

    // Apaga loading tras primer tick con datos.
    queueMicrotask(() => this.checkReady());
  }

  private checkReady(): void {
    if (this.productsStream() !== undefined) {
      this.loading.set(false);
    } else {
      setTimeout(() => this.checkReady(), 150);
    }
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  setElement(value: ElementType | 'all'): void {
    this.element.set(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: value === 'all' ? null : value },
      queryParamsHandling: 'merge',
    });
  }

  setSort(value: SortOption): void {
    this.sort.set(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: value },
      queryParamsHandling: 'merge',
    });
  }

  resetFilters(): void {
    this.search.set('');
    this.element.set('all');
    this.sort.set('popularidad');
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
