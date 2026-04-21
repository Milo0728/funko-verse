import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'eur', standalone: true, pure: true })
export class CurrencyEurPipe implements PipeTransform {
  private readonly fmt = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  });

  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return this.fmt.format(value);
  }
}
