import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'fv-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center" [style.min-height]="minHeight()">
      <div
        class="relative"
        [style.width.px]="size()"
        [style.height.px]="size()"
      >
        <span
          class="absolute inset-0 rounded-full border-2 border-violet-500/30"
        ></span>
        <span
          class="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 border-r-cyan-400 animate-spin"
        ></span>
      </div>
    </div>
  `,
})
export class SpinnerComponent {
  size = input<number>(36);
  minHeight = input<string>('200px');
}
