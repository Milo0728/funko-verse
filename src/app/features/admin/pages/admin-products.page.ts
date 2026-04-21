import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Plus, Pencil, Trash2, X, Save, Upload, Search, XCircle } from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ELEMENT_LIST, ElementType, Funko } from '../../../shared/models';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';
import { SAMPLE_FUNKOS } from '../../../core/data/sample-funkos';
import {
  SortDirection,
  SortHeaderComponent,
} from '../../../shared/components/sort-header.component';

type SortKey = 'nombre' | 'tipo' | 'precio' | 'stock' | 'descuento';

@Component({
  selector: 'fv-admin-products-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    CurrencyEurPipe,
    SortHeaderComponent,
  ],
  template: `
    <div class="space-y-5 fv-fade-in">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-xl sm:text-2xl font-bold text-white">Productos</h2>
        <div class="flex gap-2 flex-wrap">
          <button type="button" class="fv-btn fv-btn-ghost text-sm" (click)="seed()" [disabled]="seeding()">
            <lucide-icon [img]="Upload" [size]="14"/> {{ seeding() ? 'Sembrando…' : 'Cargar samples' }}
          </button>
          <button type="button" class="fv-btn fv-btn-primary text-sm" (click)="openCreate()">
            <lucide-icon [img]="Plus" [size]="14"/> Nuevo
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="fv-glass rounded-2xl p-3 flex flex-col md:flex-row gap-3">
        <div class="relative flex-1 min-w-0">
          <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          <input
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Buscar por nombre o descripción…"
            class="fv-input pl-9"
          />
          @if (search()) {
            <button type="button" (click)="search.set('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <lucide-icon [img]="XCircle" [size]="14"/>
            </button>
          }
        </div>
        <select
          [ngModel]="filterElement()"
          (ngModelChange)="filterElement.set($event)"
          class="fv-input md:w-48"
        >
          <option value="all">Todos los elementos</option>
          @for (el of elements; track el.key) {
            <option [value]="el.key">{{ el.label }}</option>
          }
        </select>
      </div>

      <!-- Desktop: tabla -->
      <div class="fv-card overflow-hidden hidden md:block">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-white/5 border-b border-white/10">
              <tr class="text-left text-slate-300">
                <th class="p-3"><fv-sort-header label="Funko" [direction]="dirFor('nombre')" (toggle)="setSort('nombre')"/></th>
                <th class="p-3"><fv-sort-header label="Elemento" [direction]="dirFor('tipo')" (toggle)="setSort('tipo')"/></th>
                <th class="p-3"><fv-sort-header label="Precio" [direction]="dirFor('precio')" (toggle)="setSort('precio')"/></th>
                <th class="p-3"><fv-sort-header label="Stock" [direction]="dirFor('stock')" (toggle)="setSort('stock')"/></th>
                <th class="p-3"><fv-sort-header label="Desc." [direction]="dirFor('descuento')" (toggle)="setSort('descuento')"/></th>
                <th class="p-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (p of rows(); track p.id) {
                <tr class="hover:bg-white/5">
                  <td class="p-3">
                    <div class="flex items-center gap-3">
                      <img [src]="p.imagen_url" class="w-10 h-10 rounded-lg object-cover shrink-0" (error)="onImgError($event)"/>
                      <div class="min-w-0">
                        <p class="text-white font-medium truncate">{{ p.nombre }}</p>
                        <p class="text-slate-500 text-xs truncate">{{ p.descripcion }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-3"><span class="fv-badge fv-badge-{{ p.tipo }}">{{ p.tipo }}</span></td>
                  <td class="p-3 text-cyan-300 font-bold">{{ p.precio | eur }}</td>
                  <td class="p-3 text-slate-200">{{ p.stock }}</td>
                  <td class="p-3 text-slate-300">{{ p.descuento ? p.descuento + '%' : '—' }}</td>
                  <td class="p-3 text-right whitespace-nowrap">
                    <button type="button" (click)="openEdit(p)" class="p-2 rounded-lg hover:bg-white/10 text-violet-300" aria-label="Editar">
                      <lucide-icon [img]="Pencil" [size]="14"/>
                    </button>
                    <button type="button" (click)="remove(p)" class="p-2 rounded-lg hover:bg-rose-500/10 text-rose-300" aria-label="Eliminar">
                      <lucide-icon [img]="Trash2" [size]="14"/>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="p-10 text-center text-slate-500">
                  {{ rawCount() === 0 ? 'Sin productos.' : 'Ningún producto coincide con los filtros.' }}
                </td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-4 py-2 text-xs text-slate-500 border-t border-white/5">
          {{ rows().length }} de {{ rawCount() }} producto(s)
        </div>
      </div>

      <!-- Mobile: cards -->
      <div class="md:hidden space-y-3">
        @for (p of rows(); track p.id) {
          <article class="fv-card p-3">
            <div class="flex gap-3">
              <img [src]="p.imagen_url" class="w-16 h-16 rounded-lg object-cover shrink-0" (error)="onImgError($event)"/>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-white font-semibold truncate">{{ p.nombre }}</p>
                  <span class="fv-badge fv-badge-{{ p.tipo }} shrink-0">{{ p.tipo }}</span>
                </div>
                <p class="text-slate-500 text-xs line-clamp-2 mt-1">{{ p.descripcion }}</p>
                <div class="flex items-center gap-3 mt-2 text-xs">
                  <span class="text-cyan-300 font-bold">{{ p.precio | eur }}</span>
                  <span class="text-slate-400">Stock: {{ p.stock }}</span>
                  @if (p.descuento) {
                    <span class="text-rose-300">-{{ p.descuento }}%</span>
                  }
                </div>
              </div>
            </div>
            <div class="mt-3 flex gap-2 pt-3 border-t border-white/5">
              <button type="button" (click)="openEdit(p)" class="fv-btn fv-btn-ghost text-xs flex-1">
                <lucide-icon [img]="Pencil" [size]="12"/> Editar
              </button>
              <button type="button" (click)="remove(p)" class="fv-btn fv-btn-ghost text-xs flex-1 text-rose-300">
                <lucide-icon [img]="Trash2" [size]="12"/> Eliminar
              </button>
            </div>
          </article>
        } @empty {
          <div class="fv-card p-8 text-center text-slate-500 text-sm">
            {{ rawCount() === 0 ? 'Sin productos.' : 'Ningún producto coincide con los filtros.' }}
          </div>
        }
        <p class="text-xs text-slate-500 text-center">{{ rows().length }} de {{ rawCount() }} producto(s)</p>
      </div>
    </div>

    <!-- Modal -->
    @if (modalOpen()) {
      <div
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 fv-fade-in"
        (click)="closeModal()"
      >
        <div class="fv-card p-5 sm:p-6 max-w-xl w-full max-h-[92vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">
              {{ editingId() ? 'Editar Funko' : 'Nuevo Funko' }}
            </h3>
            <button type="button" (click)="closeModal()" class="p-2 rounded-lg hover:bg-white/10" aria-label="Cerrar">
              <lucide-icon [img]="X" [size]="16"/>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="save()" class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-400 mb-1 block">Nombre</label>
              <input type="text" formControlName="nombre" class="fv-input"/>
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-400 mb-1 block">Descripción</label>
              <textarea rows="3" formControlName="descripcion" class="fv-input"></textarea>
            </div>
            <div>
              <label class="text-xs text-slate-400 mb-1 block">Elemento</label>
              <select formControlName="tipo" class="fv-input">
                @for (el of elements; track el.key) {
                  <option [value]="el.key">{{ el.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="text-xs text-slate-400 mb-1 block">Precio (€)</label>
              <input type="number" min="0" step="0.01" formControlName="precio" class="fv-input"/>
            </div>
            <div>
              <label class="text-xs text-slate-400 mb-1 block">Stock</label>
              <input type="number" min="0" formControlName="stock" class="fv-input"/>
            </div>
            <div>
              <label class="text-xs text-slate-400 mb-1 block">Descuento %</label>
              <input type="number" min="0" max="100" formControlName="descuento" class="fv-input"/>
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-400 mb-1 block">URL de imagen</label>
              <input type="url" formControlName="imagen_url" class="fv-input" placeholder="https://..."/>
            </div>

            <div class="sm:col-span-2 flex gap-3 mt-2">
              <button type="button" class="fv-btn fv-btn-ghost flex-1" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="fv-btn fv-btn-primary flex-1" [disabled]="form.invalid || saving()">
                <lucide-icon [img]="Save" [size]="14"/>
                {{ saving() ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AdminProductsPage {
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly Save = Save;
  readonly Upload = Upload;
  readonly Search = Search;
  readonly XCircle = XCircle;
  readonly elements = ELEMENT_LIST;

  private readonly service = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly products = toSignal(
    this.service.getAll().pipe(catchError(() => of<Funko[]>([]))),
    { initialValue: [] as Funko[] },
  );

  readonly search = signal('');
  readonly filterElement = signal<ElementType | 'all'>('all');
  readonly sortKey = signal<SortKey | null>('nombre');
  readonly sortDir = signal<SortDirection>('asc');

  readonly rawCount = computed(() => this.products().length);

  readonly rows = computed<Funko[]>(() => {
    const q = this.search().trim().toLowerCase();
    const el = this.filterElement();
    let items = this.products().filter((p) => {
      if (el !== 'all' && p.tipo !== el) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
      );
    });
    const key = this.sortKey();
    const dir = this.sortDir();
    if (key && dir) {
      const mul = dir === 'asc' ? 1 : -1;
      items = [...items].sort((a, b) => {
        const av = (a[key] ?? 0) as number | string;
        const bv = (b[key] ?? 0) as number | string;
        if (av < bv) return -1 * mul;
        if (av > bv) return 1 * mul;
        return 0;
      });
    }
    return items;
  });

  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly seeding = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    tipo: ['agua' as ElementType, Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imagen_url: ['', Validators.required],
    descuento: [0, [Validators.min(0), Validators.max(100)]],
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

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
      tipo: 'agua',
      precio: 0,
      stock: 0,
      imagen_url: '',
      descuento: 0,
    });
    this.modalOpen.set(true);
  }

  openEdit(p: Funko): void {
    this.editingId.set(p.id);
    this.form.setValue({
      nombre: p.nombre,
      descripcion: p.descripcion,
      tipo: p.tipo,
      precio: p.precio,
      stock: p.stock,
      imagen_url: p.imagen_url,
      descuento: p.descuento ?? 0,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const v = this.form.getRawValue();
      // Si el descuento es 0 o falsy, lo omitimos del payload. stripUndefined
      // (en el servicio) garantiza que no se envíe undefined a Firestore.
      const descuento = v.descuento > 0 ? v.descuento : undefined;
      if (this.editingId()) {
        await this.service.update(this.editingId()!, { ...v, descuento });
        this.toast.success('Funko actualizado');
      } else {
        await this.service.create({
          ...v,
          descuento,
          fecha_creacion: Date.now(),
          vistas: 0,
          popularidad: 0,
        });
        this.toast.success('Funko creado');
      }
      this.modalOpen.set(false);
    } catch (err) {
      console.error(err);
      this.toast.error('No pudimos guardar el Funko');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(p: Funko): Promise<void> {
    const ok = await this.toast.confirm(
      `¿Eliminar "${p.nombre}"?`,
      'Esta acción no se puede deshacer',
    );
    if (!ok) return;
    try {
      await this.service.delete(p.id);
      this.toast.success('Funko eliminado');
    } catch {
      this.toast.error('No pudimos eliminar el Funko');
    }
  }

  async seed(): Promise<void> {
    const ok = await this.toast.confirm(
      'Cargar dataset de ejemplo',
      'Se crearán los Funkos sample en Firestore.',
    );
    if (!ok) return;
    this.seeding.set(true);
    try {
      for (const f of SAMPLE_FUNKOS) {
        const { id: _ignored, ...rest } = f;
        await this.service.create(rest);
      }
      this.toast.success(`${SAMPLE_FUNKOS.length} Funkos creados`);
    } catch {
      this.toast.error('No pudimos sembrar los datos');
    } finally {
      this.seeding.set(false);
    }
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%2316182d"/><text x="50%" y="50%" fill="%238b5cf6" font-size="12" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">FV</text></svg>';
  }
}
