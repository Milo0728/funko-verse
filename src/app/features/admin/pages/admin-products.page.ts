import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ELEMENT_LIST, ElementType, Funko } from '../../../shared/models';
import { CurrencyEurPipe } from '../../../shared/pipes/currency-eur.pipe';
import { SAMPLE_FUNKOS } from '../../../core/data/sample-funkos';

@Component({
  selector: 'fv-admin-products-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideAngularModule, CurrencyEurPipe],
  template: `
    <div class="space-y-6 fv-fade-in">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white">Productos</h2>
        <div class="flex gap-2">
          <button type="button" class="fv-btn fv-btn-ghost text-sm" (click)="seed()" [disabled]="seeding()">
            <lucide-icon [img]="Upload" [size]="14"/> {{ seeding() ? 'Sembrando…' : 'Cargar samples' }}
          </button>
          <button type="button" class="fv-btn fv-btn-primary text-sm" (click)="openCreate()">
            <lucide-icon [img]="Plus" [size]="14"/> Nuevo
          </button>
        </div>
      </div>

      <div class="fv-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-white/5 border-b border-white/10">
              <tr class="text-left">
                <th class="p-3 font-semibold text-slate-300">Funko</th>
                <th class="p-3 font-semibold text-slate-300">Elemento</th>
                <th class="p-3 font-semibold text-slate-300">Precio</th>
                <th class="p-3 font-semibold text-slate-300">Stock</th>
                <th class="p-3 font-semibold text-slate-300">Desc.</th>
                <th class="p-3 font-semibold text-slate-300 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (p of products(); track p.id) {
                <tr class="hover:bg-white/5">
                  <td class="p-3">
                    <div class="flex items-center gap-3">
                      <img [src]="p.imagen_url" class="w-10 h-10 rounded-lg object-cover"/>
                      <div>
                        <p class="text-white font-medium">{{ p.nombre }}</p>
                        <p class="text-slate-500 text-xs line-clamp-1 max-w-xs">{{ p.descripcion }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-3">
                    <span class="fv-badge fv-badge-{{ p.tipo }}">{{ p.tipo }}</span>
                  </td>
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
                <tr><td colspan="6" class="p-10 text-center text-slate-500">Sin productos.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    @if (modalOpen()) {
      <div
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 fv-fade-in"
        (click)="closeModal()"
      >
        <div class="fv-card p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
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
  readonly elements = ELEMENT_LIST;

  private readonly service = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly products = toSignal(
    this.service.getAll().pipe(catchError(() => of<Funko[]>([]))),
    { initialValue: [] as Funko[] },
  );

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
      if (this.editingId()) {
        await this.service.update(this.editingId()!, {
          ...v,
          descuento: v.descuento || undefined,
        });
        this.toast.success('Funko actualizado');
      } else {
        await this.service.create({
          ...v,
          descuento: v.descuento || undefined,
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
}
