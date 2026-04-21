import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Wrapper sencillo sobre SweetAlert2 con tema personalizado
 * para no repetir configuración en cada componente.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly base = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#e2e8f0',
    customClass: {
      popup: 'fv-toast',
    },
  });

  success(message: string): void {
    this.fire('success', message);
  }

  error(message: string): void {
    this.fire('error', message);
  }

  info(message: string): void {
    this.fire('info', message);
  }

  warn(message: string): void {
    this.fire('warning', message);
  }

  private fire(icon: SweetAlertIcon, title: string): void {
    void this.base.fire({ icon, title });
  }

  async confirm(
    title: string,
    text?: string,
    confirmText = 'Sí, confirmar',
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      background: '#0f172a',
      color: '#e2e8f0',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#475569',
    });
    return result.isConfirmed;
  }
}
