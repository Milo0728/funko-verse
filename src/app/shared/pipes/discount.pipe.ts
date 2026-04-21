import { Pipe, PipeTransform } from '@angular/core';

/** Calcula el precio final tras aplicar un descuento (porcentaje). */
@Pipe({ name: 'discount', standalone: true, pure: true })
export class DiscountPipe implements PipeTransform {
  transform(price: number, percentage?: number): number {
    if (!percentage) return price;
    return price - (price * percentage) / 100;
  }
}
