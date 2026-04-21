import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'fv-skeleton-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-5" [class]="gridClass()">
      @for (_ of dummyItems(); track $index) {
        <div class="fv-card p-4 flex flex-col gap-3">
          <div class="fv-skeleton" style="height: 200px"></div>
          <div class="fv-skeleton" style="height: 16px; width: 70%"></div>
          <div class="fv-skeleton" style="height: 12px; width: 40%"></div>
          <div class="fv-skeleton" style="height: 36px; margin-top: 6px"></div>
        </div>
      }
    </div>
  `,
})
export class SkeletonCardComponent {
  count = input<number>(8);
  gridClass = input<string>(
    'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  );

  dummyItems() {
    return Array.from({ length: this.count() });
  }
}
