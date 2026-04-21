import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Search,
  Sparkles,
} from 'lucide-angular';
import { filter } from 'rxjs';
import { NavigationEnd } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../core/services/toast.service';
import { ELEMENT_LIST } from '../shared/models';

@Component({
  selector: 'fv-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <header class="sticky top-0 z-50 border-b border-violet-500/10 bg-slate-950/70 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-3 sm:px-6">
        <div class="flex items-center justify-between h-16 gap-3 sm:gap-4">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 shrink-0 group">
            <span
              class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:rotate-12 transition-transform"
            >
              <lucide-icon [img]="Sparkles" [size]="18" class="text-white"/>
            </span>
            <span class="text-xl font-black tracking-tight" style="font-family: 'Orbitron', sans-serif">
              <span class="text-white">Funko</span>
              <span class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Verse</span>
            </span>
          </a>

          <!-- Links desktop -->
          <nav class="hidden lg:flex items-center gap-1">
            <a
              routerLink="/products"
              [queryParams]="{}"
              routerLinkActive="text-white bg-white/5"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg transition"
            >
              Catálogo
            </a>
            @for (el of elements; track el.key) {
              <a
                routerLink="/products"
                [queryParams]="{ tipo: el.key }"
                class="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg transition flex items-center gap-1.5"
              >
                <span class="w-2 h-2 rounded-full" [style.background]="el.color"></span>
                {{ el.label }}
              </a>
            }
          </nav>

          <!-- Acciones -->
          <div class="flex items-center gap-1 sm:gap-2">
            <a
              routerLink="/products"
              class="hidden sm:flex p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
              aria-label="Buscar"
            >
              <lucide-icon [img]="Search" [size]="20"/>
            </a>

            @if (auth.isLogged()) {
              <a
                routerLink="/wishlist"
                class="hidden sm:flex p-2 text-slate-300 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                aria-label="Favoritos"
              >
                <lucide-icon [img]="Heart" [size]="20"/>
              </a>
            }

            <a
              routerLink="/cart"
              class="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition"
              aria-label="Carrito"
            >
              <lucide-icon [img]="ShoppingCart" [size]="20"/>
              @if (cart.count() > 0) {
                <span
                  class="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 text-white flex items-center justify-center px-1"
                >
                  {{ cart.count() }}
                </span>
              }
            </a>

            @if (!auth.isLogged()) {
              <a routerLink="/auth/login" class="hidden sm:inline-flex fv-btn fv-btn-primary text-sm">
                Entrar
              </a>
            } @else {
              <div class="relative" #userMenu>
                <button
                  type="button"
                  (click)="toggleMenu($event)"
                  class="flex items-center gap-2 px-1 sm:px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  <span
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm"
                  >
                    {{ initial() }}
                  </span>
                  <span class="hidden md:inline text-sm text-slate-200 font-medium max-w-[140px] truncate">
                    {{ auth.appUser()?.displayName ?? auth.firebaseUser()?.email }}
                  </span>
                </button>
                @if (menuOpen()) {
                  <div class="absolute right-0 mt-2 w-56 fv-glass rounded-xl py-2 shadow-2xl fv-fade-in">
                    <a
                      routerLink="/profile"
                      (click)="closeMenu()"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <lucide-icon [img]="User" [size]="15"/>
                      Mi perfil
                    </a>
                    <a
                      routerLink="/profile/orders"
                      (click)="closeMenu()"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <lucide-icon [img]="ShoppingCart" [size]="15"/>
                      Mis pedidos
                    </a>
                    <a
                      routerLink="/wishlist"
                      (click)="closeMenu()"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <lucide-icon [img]="Heart" [size]="15"/>
                      Wishlist
                    </a>
                    @if (auth.isAdmin()) {
                      <a
                        routerLink="/admin"
                        (click)="closeMenu()"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-violet-300 hover:bg-white/5"
                      >
                        <lucide-icon [img]="Shield" [size]="15"/>
                        Admin panel
                      </a>
                    }
                    <div class="border-t border-white/10 my-1"></div>
                    <button
                      type="button"
                      (click)="logout()"
                      class="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
                    >
                      <lucide-icon [img]="LogOut" [size]="15"/>
                      Cerrar sesión
                    </button>
                  </div>
                }
              </div>
            }

            <button
              type="button"
              class="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
              (click)="toggleMobile()"
              aria-label="Menú"
            >
              <lucide-icon [img]="mobileOpen() ? X : Menu" [size]="22"/>
            </button>
          </div>
        </div>

        @if (mobileOpen()) {
          <nav class="lg:hidden pb-4 space-y-1 fv-fade-in">
            <a routerLink="/products" (click)="closeMobile()" class="block px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg">
              Catálogo
            </a>
            @for (el of elements; track el.key) {
              <a
                routerLink="/products"
                [queryParams]="{ tipo: el.key }"
                (click)="closeMobile()"
                class="block px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg"
              >
                <span class="inline-block w-2 h-2 rounded-full mr-2" [style.background]="el.color"></span>
                {{ el.label }}
              </a>
            }
            <a routerLink="/cart" (click)="closeMobile()" class="block px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg">
              Carrito
            </a>
            @if (auth.isLogged()) {
              <a routerLink="/wishlist" (click)="closeMobile()" class="block px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg">
                Wishlist
              </a>
              <a routerLink="/profile/orders" (click)="closeMobile()" class="block px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg">
                Mis pedidos
              </a>
            } @else {
              <a routerLink="/auth/login" (click)="closeMobile()" class="block px-3 py-2 text-violet-300 hover:bg-white/5 rounded-lg font-semibold">
                Entrar
              </a>
            }
          </nav>
        }
      </div>
    </header>
  `,
})
export class NavbarComponent {
  readonly ShoppingCart = ShoppingCart;
  readonly Heart = Heart;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Shield = Shield;
  readonly Menu = Menu;
  readonly X = X;
  readonly Search = Search;
  readonly Sparkles = Sparkles;
  readonly elements = ELEMENT_LIST;

  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly menuOpen = signal(false);
  readonly mobileOpen = signal(false);

  constructor() {
    // Cierra los menús al navegar.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.mobileOpen.set(false);
      });
  }

  /** Cierra el menú de usuario al clicar fuera del header. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) return;
    const host = this.elementRef.nativeElement;
    if (!host.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
    this.mobileOpen.set(false);
  }

  initial(): string {
    const name = this.auth.appUser()?.displayName ?? this.auth.firebaseUser()?.email ?? '?';
    return name.charAt(0).toUpperCase();
  }

  toggleMenu(ev: Event): void {
    ev.stopPropagation();
    this.menuOpen.update((v) => !v);
  }
  closeMenu(): void {
    this.menuOpen.set(false);
  }
  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }
  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  async logout(): Promise<void> {
    this.closeMenu();
    await this.auth.logout();
    this.toast.info('Sesión cerrada');
    await this.router.navigate(['/']);
  }
}
