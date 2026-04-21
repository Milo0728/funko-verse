# FunkoVerse

E-commerce de Funkos inspirado en los **4 elementos** — agua, fuego, aire y tierra.

## Stack

- **Frontend**: Angular 21 · Standalone components · Signals · Lazy loading · Tailwind v4
- **Backend / BaaS**: Firebase (Auth, Firestore, Storage)
- **UI**: Tailwind · SweetAlert2 · Lucide Icons · Chart.js (via ng2-charts)
- **Deploy**: listo para Vercel (`vercel.json` incluido)

## Arquitectura

```
src/app
├── core
│   ├── config       # Firebase providers
│   ├── data         # sample-funkos (datos de ejemplo)
│   ├── guards       # authGuard, adminGuard, guestGuard
│   └── services     # Auth, Product, Cart, Order, Wishlist, Promotion, Toast, User
├── features
│   ├── auth         # login, register, forgot
│   ├── products     # home, catálogo, detalle
│   ├── cart         # carrito + checkout
│   ├── orders       # mis pedidos
│   ├── wishlist
│   ├── profile
│   ├── admin        # dashboard, productos, pedidos, promociones
│   └── shared-pages # 404
├── layout           # navbar, footer, shell
├── shared
│   ├── components   # funko-card, spinner, skeleton
│   ├── models       # Funko, User, Cart, Order, Promotion, Wishlist
│   └── pipes        # eur, discount
└── app.routes.ts
```

## Puesta en marcha

1. Instala dependencias:
   ```bash
   npm install
   ```

2. Configura Firebase en `src/environments/environment.ts` con los credenciales
   de tu proyecto (Console → Project settings → SDK):

   ```ts
   export const environment = {
     production: false,
     useFirebaseEmulator: false,
     firebase: {
       apiKey: '...',
       authDomain: '...',
       projectId: '...',
       storageBucket: '...',
       messagingSenderId: '...',
       appId: '...',
     },
   };
   ```

3. En Firestore las colecciones (`users`, `products`, `orders`, `wishlist`,
   `cart`, `promotions`) se crean automáticamente al escribir la primera vez.

4. Levanta el servidor:
   ```bash
   npm start
   ```

## Primer uso

- Regístrate en `/auth/register`. Se creará un documento en `users/{uid}` con `role: 'user'`.
- Para promover un usuario a **admin**, edita su documento en Firestore y cambia
  `role` a `"admin"`. Al recargar verás el acceso al panel en la navbar.
- Desde `/admin/products` pulsa **Cargar samples** para sembrar los Funkos
  de ejemplo en Firestore.

> Antes de configurar Firebase, el catálogo cae automáticamente al dataset local
> en `src/app/core/data/sample-funkos.ts`, así puedes trastear con la UI sin
> depender de la red.

## Funcionalidades

- Catálogo con filtros por elemento, búsqueda y orden (precio, popularidad, nuevos).
- Página de producto con contador de vistas, stock, relacionados y descuentos.
- Carrito persistente: localStorage (invitado) + Firestore (logueado, merge automático).
- Checkout 4 pasos simulado: resumen → dirección → pago (tarjeta/PayPal fake) → confirmación.
- Wishlist sincronizada en Firestore.
- Perfil con datos y dirección de envío.
- Historial de pedidos con estados (pendiente/pagado/enviado/entregado/cancelado).
- Admin: dashboard con métricas + gráfica doughnut, CRUD de productos, gestión
  de pedidos, promociones temporales.

## Deploy a Vercel

Ya hay un `vercel.json` listo. Solo tienes que conectar el repo a Vercel
con framework preset Angular y output en `dist/FunkoVerse/browser`.

## Scripts

- `npm start` — dev server en `http://localhost:4200`
- `npm run build` — build de producción
- `npm test` — suite con Vitest
