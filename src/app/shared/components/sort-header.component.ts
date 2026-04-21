import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-angular';

export type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'fv-sort-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      (click)="toggle.emit()"
      class="flex items-center gap-1 hover:text-white transition w-full text-left font-semibold"
      [class.text-white]="active()"
    >
      <span>{{ label() }}</span>
      @if (direction() === 'asc') {
        <lucide-icon [img]="ChevronUp" [size]="14"/>
      } @else if (direction() === 'desc') {
        <lucide-icon [img]="ChevronDown" [size]="14"/>
      } @else {
        <lucide-icon [img]="ChevronsUpDown" [size]="14" class="opacity-40"/>
      }
    </button>
  `,
})
export class SortHeaderComponent {
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly ChevronsUpDown = ChevronsUpDown;

  label = input.required<string>();
  direction = input<SortDirection>(null);

  toggle = output<void>();

  active(): boolean {
    return this.direction() !== null;
  }
}
