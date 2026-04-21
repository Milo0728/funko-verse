export type ElementType = 'agua' | 'fuego' | 'aire' | 'tierra';

export interface ElementMeta {
  key: ElementType;
  label: string;
  gradient: string;
  color: string;
  textColor: string;
  icon: string;
}

export const ELEMENTS: Record<ElementType, ElementMeta> = {
  agua: {
    key: 'agua',
    label: 'Agua',
    gradient: 'from-sky-400 via-cyan-500 to-blue-600',
    color: '#22d3ee',
    textColor: 'text-cyan-300',
    icon: 'droplet',
  },
  fuego: {
    key: 'fuego',
    label: 'Fuego',
    gradient: 'from-amber-400 via-orange-500 to-rose-600',
    color: '#f97316',
    textColor: 'text-orange-300',
    icon: 'flame',
  },
  aire: {
    key: 'aire',
    label: 'Aire',
    gradient: 'from-slate-200 via-indigo-300 to-violet-400',
    color: '#a78bfa',
    textColor: 'text-violet-300',
    icon: 'wind',
  },
  tierra: {
    key: 'tierra',
    label: 'Tierra',
    gradient: 'from-lime-400 via-emerald-500 to-teal-700',
    color: '#10b981',
    textColor: 'text-emerald-300',
    icon: 'mountain',
  },
};

export const ELEMENT_LIST: ElementMeta[] = Object.values(ELEMENTS);
