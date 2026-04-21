import { Funko } from '../../shared/models';

/**
 * Dataset de ejemplo. Úsalo para sembrar Firestore (colección `products`)
 * desde el panel de admin, o para pruebas locales antes de conectar Firebase.
 */
export const SAMPLE_FUNKOS: Funko[] = [
  {
    id: 'sample-001',
    nombre: 'Korra — Avatar del Agua',
    descripcion:
      'Funko de edición elemental con pose de maestría. Acabado translúcido inspirado en el océano.',
    tipo: 'agua',
    precio: 24.99,
    stock: 32,
    imagen_url:
      'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?q=80&w=800',
    descuento: 10,
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 3,
    vistas: 128,
    popularidad: 42,
    destacado: true,
  },
  {
    id: 'sample-002',
    nombre: 'Natsu Dragneel — Furia del Fuego',
    descripcion:
      'Serie Dragon Slayer. Detalles de llama pintados a mano y base efecto magma.',
    tipo: 'fuego',
    precio: 29.5,
    stock: 18,
    imagen_url:
      'https://images.unsplash.com/photo-1534445867742-43195f401b6c?q=80&w=800',
    descuento: 15,
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 7,
    vistas: 402,
    popularidad: 87,
    destacado: true,
  },
  {
    id: 'sample-003',
    nombre: 'Aang — Maestro del Aire',
    descripcion:
      'Versión definitiva con tatuajes brillantes en la oscuridad y báculo desmontable.',
    tipo: 'aire',
    precio: 27.0,
    stock: 25,
    imagen_url:
      'https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800',
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 1,
    vistas: 76,
    popularidad: 14,
  },
  {
    id: 'sample-004',
    nombre: 'Toph — Guerrera de Tierra',
    descripcion:
      'Figura con base rocosa texturizada. Edición limitada FunkoVerse.',
    tipo: 'tierra',
    precio: 26.5,
    stock: 12,
    imagen_url:
      'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=800',
    descuento: 20,
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 10,
    vistas: 233,
    popularidad: 61,
  },
  {
    id: 'sample-005',
    nombre: 'Gray Fullbuster — Ice Make',
    descripcion: 'Funko con base de hielo cristalino y brazos en pose de sello.',
    tipo: 'agua',
    precio: 28.0,
    stock: 9,
    imagen_url:
      'https://images.unsplash.com/photo-1606166187734-a4cb74079037?q=80&w=800',
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 14,
    vistas: 310,
    popularidad: 72,
  },
  {
    id: 'sample-006',
    nombre: 'Portgas D. Ace — Llamas del Mera Mera',
    descripcion:
      'Edición One Piece. Incluye efectos de fuego desmontables y sombrero vaquero.',
    tipo: 'fuego',
    precio: 32.99,
    stock: 20,
    imagen_url:
      'https://images.unsplash.com/photo-1608889175638-9322300c87e7?q=80&w=800',
    descuento: 5,
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 20,
    vistas: 512,
    popularidad: 99,
    destacado: true,
  },
  {
    id: 'sample-007',
    nombre: 'Rengoku — Pilar de las Llamas',
    descripcion: 'Pose icónica con katana en llamas y uniforme de Hashira.',
    tipo: 'fuego',
    precio: 34.5,
    stock: 7,
    imagen_url:
      'https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?q=80&w=800',
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 5,
    vistas: 188,
    popularidad: 45,
  },
  {
    id: 'sample-008',
    nombre: 'Tanjiro — Respiración del Agua',
    descripcion:
      'Figura con efecto de agua en espiral y haori con patrón a cuadros.',
    tipo: 'agua',
    precio: 30.0,
    stock: 22,
    imagen_url:
      'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?q=80&w=800',
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 2,
    vistas: 145,
    popularidad: 38,
  },
  {
    id: 'sample-009',
    nombre: 'Rock Lee — Puño de Tierra',
    descripcion: 'Edición Konoha en pose de Taijutsu con cráter bajo sus pies.',
    tipo: 'tierra',
    precio: 22.0,
    stock: 40,
    imagen_url:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800',
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 6,
    vistas: 92,
    popularidad: 27,
  },
  {
    id: 'sample-010',
    nombre: 'Edward Elric — Alquimista Tierra',
    descripcion: 'FullMetal clásico con efectos de transmutación.',
    tipo: 'tierra',
    precio: 33.0,
    stock: 15,
    imagen_url:
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=800',
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 8,
    vistas: 360,
    popularidad: 80,
  },
  {
    id: 'sample-011',
    nombre: 'Storm — Tormenta de Aire',
    descripcion: 'Edición X-Men con base electrificada y cabello al viento.',
    tipo: 'aire',
    precio: 29.99,
    stock: 11,
    imagen_url:
      'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=800',
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 4,
    vistas: 210,
    popularidad: 54,
  },
  {
    id: 'sample-012',
    nombre: 'Howl — Castillo Ambulante',
    descripcion: 'Versión Ghibli en pose de vuelo con capa volando.',
    tipo: 'aire',
    precio: 36.0,
    stock: 6,
    imagen_url:
      'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=800',
    descuento: 12,
    fecha_creacion: Date.now() - 1000 * 60 * 60 * 24 * 12,
    vistas: 421,
    popularidad: 93,
    destacado: true,
  },
];
