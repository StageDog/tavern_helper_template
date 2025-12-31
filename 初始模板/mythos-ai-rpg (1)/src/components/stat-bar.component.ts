
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-1 w-full mb-3">
      <div class="flex justify-between text-xs font-rpg-header uppercase tracking-widest text-[var(--text-muted)]">
        <span>{{ label() }}</span>
        <span>{{ current() }} / {{ max() }}</span>
      </div>
      <div class="h-3 w-full bg-[var(--bg-element)] border border-[var(--border-color)] rounded-sm relative overflow-hidden">
        <!-- Background pulse effect -->
        <div class="absolute inset-0 bg-black/20 animate-pulse opacity-50"></div>
        <!-- Actual bar -->
        <div 
          class="h-full transition-all duration-500 ease-out relative"
          [style.width.%]="percentage()"
          [class]="colorClass()"
        >
          <div class="absolute inset-0 bg-white/20"></div>
        </div>
      </div>
    </div>
  `
})
export class StatBarComponent {
  label = input.required<string>();
  current = input.required<number>();
  max = input.required<number>();
  color = input<string>('red'); // red, blue, green, yellow

  percentage = computed(() => {
    const p = (this.current() / this.max()) * 100;
    return Math.max(0, Math.min(100, p));
  });

  colorClass = computed(() => {
    // Keep semantic colors for bars as they are universally understood (HP=Red, MP=Blue)
    switch (this.color()) {
      case 'blue': return 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]';
      case 'green': return 'bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.5)]';
      case 'yellow': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
      default: return 'bg-red-700 shadow-[0_0_10px_rgba(185,28,28,0.5)]';
    }
  });
}
