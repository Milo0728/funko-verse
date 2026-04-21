import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Plus, Trash2, Tag, Calendar } from 'lucide-angular';
import { catchError, of } from 'rxjs';

import { PromotionService } from '../../../core/services/promotion.service';
import { ToastService } from '../../../core/services/toast.service';
import { ELEMENT_LIST, Promotion, PromotionType } from '../../../shared/models';

@Component({
  selector: 'fv-admin-promotions-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 fv-fade-in">
      <h2 class="text-2xl font-bold text-white">Promociones</h2>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Crear -->
        <div class="fv-card p-6 h-fit">
          <h3 class="text-white font-bold mb-4 flex items-center gap-2">
            <lucide-icon [img]="Plus" [size]="16"/> Nueva promoción
          </h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-3">
            <div>
              <label class="text-xs text-slate-400 mb-1 block">Nombre</label>
              <input type="text" formControlName="nombre" class="fv-input"/>
            </div>
            <div>
              <label class="text-xs text-slate-400 mb-1 block">Tipo</label>
              <select formControlName="tipo" class="fv-input">
                <option value="global">Global</option>
                <option value="elemento">Por elemento</option>
                <option value="producto">Producto concreto</option>
              </select>
            </div>
            @if (form.controls.tipo.value === 'elemento') {
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Elemento</label>
                <select formControlName="targetId" class="fv-input">
                  @for (el of elements; track el.key) {
                    <option [value]="el.key">{{ el.label }}</option>
                  }
                </select>
              </div>
            } @else if (form.controls.tipo.value === 'producto') {
              <div>
                <label class="text-xs text-slate-400 mb-1 block">ID del Funko</label>
                <input type="text" formControlName="targetId" class="fv-input"/>
              </div>
            }
            <div>
              <label class="text-xs text-slate-400 mb-1 block">Descuento %</label>
              <input type="number" min="1" max="90" formControlName="descuento" class="fv-input"/>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Desde</label>
                <input type="date" formControlName="desde" class="fv-input"/>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Hasta</label>
                <input type="date" formControlName="hasta" class="fv-input"/>
              </div>
            </div>
            <button type="submit" class="fv-btn fv-btn-primary w-full" [disabled]="form.invalid">
              <lucide-icon [img]="Plus" [size]="14"/> Crear promoción
            </button>
          </form>
        </div>

        <!-- Listado -->
        <div class="lg:col-span-2 space-y-3">
          @for (p of promos(); track p.id) {
            <article class="fv-card p-4 flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <lucide-icon [img]="Tag" [size]="14" class="text-violet-300"/>
                  <span class="text-white font-semibold">{{ p.nombre }}</span>
                  <span class="fv-badge fv-badge-aire">{{ p.tipo }}</span>
                </div>
                <p class="text-xs text-slate-400 flex items-center gap-2">
                  <lucide-icon [img]="Calendar" [size]="12"/>
                  {{ formatDate(p.desde) }} → {{ formatDate(p.hasta) }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-2xl font-black fv-title">-{{ p.descuento }}%</span>
                <button type="button" (click)="remove(p)" class="p-2 rounded-lg hover:bg-rose-500/10 text-rose-300" aria-label="Eliminar">
                  <lucide-icon [img]="Trash2" [size]="14"/>
                </button>
              </div>
            </article>
          } @empty {
            <div class="fv-card p-10 text-center text-slate-500">
              Todavía no hay promociones.
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminPromotionsPage {
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Tag = Tag;
  readonly Calendar = Calendar;
  readonly elements = ELEMENT_LIST;

  private readonly service = inject(PromotionService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly promos = toSignal(
    this.service.getAll().pipe(catchError(() => of<Promotion[]>([]))),
    { initialValue: [] as Promotion[] },
  );

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipo: ['global' as PromotionType, Validators.required],
    targetId: [''],
    descuento: [10, [Validators.required, Validators.min(1), Validators.max(90)]],
    desde: [this.todayISO()],
    hasta: [this.inDaysISO(14)],
  });

  async save(): Promise<void> {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    try {
      await this.service.create({
        nombre: v.nombre,
        tipo: v.tipo,
        targetId: v.targetId || undefined,
        descuento: v.descuento,
        desde: new Date(v.desde).getTime(),
        hasta: new Date(v.hasta).getTime(),
        activo: true,
        createdAt: Date.now(),
      });
      this.toast.success('Promoción creada');
      this.form.reset({
        nombre: '',
        tipo: 'global',
        targetId: '',
        descuento: 10,
        desde: this.todayISO(),
        hasta: this.inDaysISO(14),
      });
    } catch {
      this.toast.error('No pudimos crear la promoción');
    }
  }

  async remove(p: Promotion): Promise<void> {
    const ok = await this.toast.confirm(`¿Eliminar "${p.nombre}"?`);
    if (!ok) return;
    try {
      await this.service.delete(p.id);
      this.toast.success('Promoción eliminada');
    } catch {
      this.toast.error('No pudimos eliminar la promoción');
    }
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('es-ES');
  }

  private todayISO(): string {
    return new Date().toISOString().slice(0, 10);
  }
  private inDaysISO(days: number): string {
    return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  }
}
