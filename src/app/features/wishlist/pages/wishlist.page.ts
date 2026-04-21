import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductService } from '../../../core/services/product.service';
import { FunkoCardComponent } from '../../../shared/components/funko-card.component';
import { SpinnerComponent } from '../../../shared/components/spinner.component';
import { Funko } from '../../../shared/models';
import { SAMPLE_FUNKOS } from '../../../core/data/sample-funkos';

@Component({
  selector: 'fv-wishlist-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, FunkoCardComponent, SpinnerComponent],
  template: `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <header class="mb-8 fv-fade-in">
        <h1 class="text-4xl font-black fv-title flex items-center gap-3" style="font-family: 'Orbitron', sans-serif">
          <lucide-icon [img]="Heart" [size]="30" class="text-rose-400"/>
          Mi Wishlist
        </h1>
        <p class="text-slate-400 mt-2">Los Funkos que quieres conseguir.</p>
      </header>

      @if (loading()) {
        <fv-spinner minHeight="300px"/>
      } @else if (items().length === 0) {
        <div class="fv-card p-10 text-center">
          <lucide-icon [img]="Heart" [size]="40" class="mx-auto text-slate-500 mb-3"/>
          <p class="text-slate-300 mb-3">No tienes Funkos guardados todavía.</p>
          <a routerLink="/products" class="fv-btn fv-btn-primary">Ir al catálogo</a>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          @for (f of items(); track f.id) {
            <fv-funko-card [funko]="f"/>
          }
        </div>
      }
    </section>
  `,
})
export class WishlistPage implements OnInit {
  readonly Heart = Heart;

  private readonly auth = inject(AuthService);
  private readonly wishlist = inject(WishlistService);
  private readonly products = inject(ProductService);

  readonly items = signal<Funko[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    const uid = this.auth.firebaseUser()?.uid;
    if (!uid) {
      this.loading.set(false);
      return;
    }
    try {
      const ids = await this.wishlist.getFavoriteIds(uid);
      const found: Funko[] = [];
      for (const id of ids) {
        try {
          const f = await firstValueFrom(this.products.getById(id));
          if (f) {
            found.push(f);
            continue;
          }
        } catch {
          /* fallback */
        }
        const sample = SAMPLE_FUNKOS.find((s) => s.id === id);
        if (sample) found.push(sample);
      }
      this.items.set(found);
    } finally {
      this.loading.set(false);
    }
  }
}
