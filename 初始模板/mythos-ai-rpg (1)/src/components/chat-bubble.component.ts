import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanitizeHtmlPipe } from '../pipes/sanitize-html.pipe';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, SanitizeHtmlPipe],
  template: `
    <div class="mb-6 flex flex-col animate-fadeIn" [class.items-end]="isUser()" [class.items-start]="!isUser()">
      
      <!-- Sender Name -->
      <div class="mb-1 text-xs font-rpg-header font-bold tracking-widest uppercase opacity-70"
           [class.text-[var(--accent-primary)]]="isUser()" 
           [class.text-purple-400]="!isUser() && !isColorful()"
           [class.text-[var(--text-muted)]]="!isUser() && isColorful()">
        @if (isUser()) {
          你
        } @else {
          地下城主
        }
      </div>

      <!-- Message Box -->
      <div class="max-w-[90%] md:max-w-[80%] relative group">
        <!-- Decorative corners for GM -->
        @if (!isUser()) {
          <div class="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[var(--border-color)] opacity-50"></div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[var(--border-color)] opacity-50"></div>
        }

        <div class="px-5 py-4 rounded-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap shadow-lg border backdrop-blur-sm transition-colors duration-300"
             [class.bg-[var(--bg-element)]]="isUser()"
             [class.border-[var(--border-color)]]="isUser()"
             [class.text-[var(--text-main)]]="isUser()"
             [class.bg-[var(--bg-panel)]]="!isUser()"
             [class.border-[var(--accent-secondary)]]="!isUser()"
             [class.text-[var(--text-main)]]="!isUser()"
             (click)="onBubbleClick($event)">
           <span [innerHTML]="processedText() | sanitizeHtml"></span>
           @if (isStreaming()) {
             <span class="inline-block w-2 h-4 ml-1 bg-[var(--accent-primary)] animate-pulse align-middle"></span>
           }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    /* Style for interactive keywords inside the bubble */
    :host ::ng-deep .interactive-keyword {
      background-color: rgba(245, 158, 11, 0.1); /* --accent-primary at 10% opacity */
      border-bottom: 1px solid rgba(245, 158, 11, 0.4); /* --accent-primary at 40% opacity */
      padding: 0 2px;
      margin: 0 1px;
      border-radius: 2px;
      color: #f59e0b; /* --accent-primary */
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease-in-out;
    }
    :host ::ng-deep .interactive-keyword:hover {
      background-color: rgba(245, 158, 11, 0.3);
      border-bottom-color: #f59e0b;
      box-shadow: 0 0 8px rgba(245,158,11,0.5); /* --accent-glow */
    }
  `]
})
export class ChatBubbleComponent {
  text = input.required<string>();
  role = input.required<'user' | 'model'>();
  isStreaming = input<boolean>(false);
  interact = output<string>();

  processedText = computed(() => {
    if (this.isUser() || !this.text()) {
      return this.text();
    }
    // Replace [INTERACTABLE]...[/INTERACTABLE] with a button-like element
    return this.text().replace(
      /\[INTERACTABLE\](.*?)\[\/INTERACTABLE\]/g, 
      `<button class="interactive-keyword" data-keyword="$1">$1</button>`
    );
  });

  isUser() {
    return this.role() === 'user';
  }

  isColorful() {
    return true; 
  }

  onBubbleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('interactive-keyword')) {
      const keyword = target.getAttribute('data-keyword');
      if (keyword) {
        this.interact.emit(keyword);
      }
    }
  }
}
