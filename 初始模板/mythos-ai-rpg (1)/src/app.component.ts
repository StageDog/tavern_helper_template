import { Component, signal, ViewChild, ElementRef, AfterViewChecked, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { ChatBubbleComponent } from './components/chat-bubble.component';
import { StatBarComponent } from './components/stat-bar.component';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { SanitizeUrlPipe } from './pipes/sanitize-url.pipe';

interface Message {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

interface Item {
  name: string;
  count: number;
}

interface Stats {
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  xp: number;
  maxXp: number;
  str: number;
  dex: number;
  int: number;
  cha: number;
  inventory: Item[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatBubbleComponent, StatBarComponent, NgOptimizedImage, SanitizeHtmlPipe, SanitizeUrlPipe],
  styles: [`
    @keyframes logEntry {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-logEntry {
      animation: logEntry 0.3s ease-out forwards;
    }
    @keyframes sceneFadeIn {
      from { opacity: 0; filter: blur(10px); }
      to { opacity: 1; filter: blur(0); }
    }
    .animate-sceneFadeIn {
      animation: sceneFadeIn 0.8s ease-out forwards;
    }
  `],
  template: `
    <div class="relative w-full h-full flex flex-col md:flex-row bg-[var(--bg-main)] text-[var(--text-main)] font-rpg-body overflow-hidden transition-colors duration-500">
      
      <!-- Background Ambience -->
      <div class="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--bg-element)] to-[var(--bg-main)] z-0"></div>
      <div class="absolute inset-0 pointer-events-none opacity-5" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

      <!-- Sidebar (Character Sheet) -->
      <aside class="relative z-20 w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[var(--bg-panel)]/95 flex flex-col shrink-0 transition-all duration-300"
            [class.h-full]="!mobileMenuCollapsed()"
            [class.h-16]="mobileMenuCollapsed()">
        
        <!-- Sidebar Header / Mobile Toggle -->
        <div class="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-element)]/50 shrink-0">
          <h1 class="font-rpg-header text-[var(--accent-primary)] text-xl font-bold tracking-wider text-glow flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            神话编年史
          </h1>
          <button class="md:hidden text-[var(--text-muted)] hover:text-[var(--text-main)]" (click)="toggleMobileMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Character Stats Container -->
        <div class="flex-1 overflow-y-auto" [class.hidden]="mobileMenuCollapsed() && isMobile()">
          
          <!-- Avatar & Name -->
          <div class="p-6">
            <div class="flex justify-center mb-6 relative">
              <div class="w-24 h-24 rounded-full border-2 border-[var(--accent-secondary)] bg-[var(--bg-element)] flex items-center justify-center overflow-hidden shadow-[0_0_15px_var(--accent-glow)]">
                <img [ngSrc]="'https://picsum.photos/200/200'" priority width="200" height="200" alt="Character" class="opacity-80 hover:scale-110 transition-transform duration-700">
              </div>
              <div class="absolute bottom-0 bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)] text-xs text-[var(--accent-primary)] font-bold tracking-widest uppercase shadow-sm">
                Lv {{ stats().level }}
              </div>
            </div>
            <div class="text-center mb-4">
              <h2 class="text-lg text-[var(--text-main)] font-rpg-header font-bold">{{ stats().name }}</h2>
              <p class="text-[var(--text-muted)] text-sm uppercase tracking-wide">{{ stats().class }}</p>
            </div>
          </div>
          
          <!-- ACCORDION -->
          <div class="px-4 space-y-1">
              <!-- Stats Accordion Item -->
              <div>
                <h3 class="font-rpg-header">
                  <button (click)="toggleAccordion('stats')" class="flex items-center justify-between w-full p-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)]/50 rounded">
                    <span>核心状态</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300" [class.rotate-180]="activeAccordion() === 'stats'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </h3>
                <div class="overflow-hidden transition-all duration-500 ease-in-out" [class.max-h-96]="activeAccordion() === 'stats'" [class.max-h-0]="activeAccordion() !== 'stats'">
                  <div class="pt-2 pb-4 px-2 border-l-2 border-[var(--border-color)] ml-3">
                    <app-stat-bar label="生命值" [current]="stats().hp" [max]="stats().maxHp" color="red" />
                    <app-stat-bar label="法力值" [current]="stats().mp" [max]="stats().maxMp" color="blue" />
                    <app-stat-bar label="经验值" [current]="stats().xp" [max]="stats().maxXp" color="yellow" />
                  </div>
                </div>
              </div>
              
              <!-- Attributes Accordion Item -->
              <div>
                <h3 class="font-rpg-header">
                  <button (click)="toggleAccordion('attributes')" class="flex items-center justify-between w-full p-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)]/50 rounded">
                    <span>角色属性</span>
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300" [class.rotate-180]="activeAccordion() === 'attributes'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </h3>
                <div class="overflow-hidden transition-all duration-500 ease-in-out" [class.max-h-96]="activeAccordion() === 'attributes'" [class.max-h-0]="activeAccordion() !== 'attributes'">
                  <div class="pt-2 pb-4 px-2 border-l-2 border-[var(--border-color)] ml-3">
                     <div class="grid grid-cols-2 gap-4 mt-2">
                        <div class="bg-[var(--bg-element)]/50 p-3 rounded border border-[var(--border-color)] text-center">
                          <div class="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">力量</div>
                          <div class="text-xl font-rpg-header text-[var(--text-main)]">{{ stats().str }}</div>
                        </div>
                        <div class="bg-[var(--bg-element)]/50 p-3 rounded border border-[var(--border-color)] text-center">
                          <div class="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">敏捷</div>
                          <div class="text-xl font-rpg-header text-[var(--text-main)]">{{ stats().dex }}</div>
                        </div>
                        <div class="bg-[var(--bg-element)]/50 p-3 rounded border border-[var(--border-color)] text-center">
                          <div class="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">智力</div>
                          <div class="text-xl font-rpg-header text-[var(--text-main)]">{{ stats().int }}</div>
                        </div>
                        <div class="bg-[var(--bg-element)]/50 p-3 rounded border border-[var(--border-color)] text-center">
                          <div class="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">魅力</div>
                          <div class="text-xl font-rpg-header text-[var(--text-main)]">{{ stats().cha }}</div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              <!-- Inventory Accordion Item -->
              <div>
                <h3 class="font-rpg-header">
                  <button (click)="toggleAccordion('inventory')" class="flex items-center justify-between w-full p-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)]/50 rounded">
                    <span>背包</span>
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300" [class.rotate-180]="activeAccordion() === 'inventory'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </h3>
                <div class="overflow-hidden transition-all duration-500 ease-in-out" [class.max-h-96]="activeAccordion() === 'inventory'" [class.max-h-0]="activeAccordion() !== 'inventory'">
                  <div class="pt-2 pb-4 px-2 border-l-2 border-[var(--border-color)] ml-3">
                    <ul class="space-y-2 text-sm text-[var(--text-muted)] mt-2">
                      @for (item of stats().inventory; track $index) {
                        <li class="flex items-center justify-between border-b border-[var(--border-color)]/50 pb-1">
                          <span>{{ item.name }}</span>
                          <span class="text-xs opacity-70">x{{ item.count }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <!-- Sidebar Footer (Navigation) -->
        <div class="mt-auto p-2 border-t border-[var(--border-color)] bg-[var(--bg-panel)]/80 backdrop-blur-sm" [class.hidden]="mobileMenuCollapsed() && isMobile()">
            <nav class="flex justify-around">
                <button (click)="setNav('home')" class="flex flex-col items-center gap-1 p-1 rounded w-16 transition-colors" [class.text-[var(--accent-primary)]]="activeNav() === 'home'" [class.text-[var(--text-muted)]]="activeNav() !== 'home'" [class.bg-[var(--bg-element)]]="activeNav() === 'home'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span class="text-xs font-rpg-body">首页</span>
                </button>
                <button (click)="setNav('discover')" class="flex flex-col items-center gap-1 p-1 rounded w-16 transition-colors" [class.text-[var(--accent-primary)]]="activeNav() === 'discover'" [class.text-[var(--text-muted)]]="activeNav() !== 'discover'" [class.bg-[var(--bg-element)]]="activeNav() === 'discover'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    <span class="text-xs font-rpg-body">发现</span>
                </button>
                <button (click)="setNav('play')" class="flex flex-col items-center gap-1 p-1 rounded w-16 transition-colors" [class.text-[var(--accent-primary)]]="activeNav() === 'play'" [class.text-[var(--text-muted)]]="activeNav() !== 'play'" [class.bg-[var(--bg-element)]]="activeNav() === 'play'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span class="text-xs font-rpg-body">PLAY</span>
                </button>
                 <button (click)="setNav('orders')" class="flex flex-col items-center gap-1 p-1 rounded w-16 transition-colors" [class.text-[var(--accent-primary)]]="activeNav() === 'orders'" [class.text-[var(--text-muted)]]="activeNav() !== 'orders'" [class.bg-[var(--bg-element)]]="activeNav() === 'orders'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <span class="text-xs font-rpg-body">订单</span>
                </button>
                <button (click)="setNav('me')" class="flex flex-col items-center gap-1 p-1 rounded w-16 transition-colors" [class.text-[var(--accent-primary)]]="activeNav() === 'me'" [class.text-[var(--text-muted)]]="activeNav() !== 'me'" [class.bg-[var(--bg-element)]]="activeNav() === 'me'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span class="text-xs font-rpg-body">我的</span>
                </button>
            </nav>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-main)]">
        @switch (activeNav()) {
          @case ('play') {
            <!-- Scene Image Banner -->
            <div class="relative h-48 w-full shrink-0 border-b-2 border-[var(--border-color)] bg-[var(--bg-element)]/50">
              @if (isGeneratingImage()) {
                <div class="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div class="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <svg class="animate-spin h-8 w-8 text-[var(--accent-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span class="font-rpg-header text-sm tracking-widest">描绘场景中...</span>
                  </div>
                </div>
              }
              @if (sceneImageUrl()) {
                <img [src]="sceneImageUrl() | sanitizeUrl" alt="Scene Image" class="w-full h-full object-cover animate-sceneFadeIn">
              }
              <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] to-transparent"></div>
              <div class="absolute top-2 right-2 flex gap-2">
                <div class="flex gap-1 bg-[var(--bg-element)]/50 p-1 rounded-lg backdrop-blur-sm">
                  <button (click)="setTheme('dark')" class="p-1.5 rounded hover:bg-[var(--bg-panel)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]" title="暗色模式"><div class="w-4 h-4 rounded-full bg-slate-900 border border-slate-600"></div></button>
                  <button (click)="setTheme('light')" class="p-1.5 rounded hover:bg-[var(--bg-panel)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]" title="浅色模式"><div class="w-4 h-4 rounded-full bg-slate-100 border border-slate-300"></div></button>
                  <button (click)="setTheme('colorful')" class="p-1.5 rounded hover:bg-[var(--bg-panel)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]" title="炫彩模式"><div class="w-4 h-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border border-purple-400"></div></button>
                  <button (click)="setTheme('meituan')" class="p-1.5 rounded hover:bg-[var(--bg-panel)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]" title="美团黄"><div class="w-4 h-4 rounded-full bg-[#FFC300] border border-yellow-600"></div></button>
                </div>
                <button (click)="toggleFullscreen()" class="p-2 text-white bg-[var(--bg-element)]/50 backdrop-blur-sm hover:bg-[var(--bg-panel)] rounded transition-colors" title="全屏切换">
                  @if (isFullscreen) { <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg> } 
                  @else { <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> }
                </button>
              </div>
            </div>

            <!-- Message List -->
            <div #chatContainer class="flex-1 overflow-y-auto p-4 md:p-8 pb-4 scroll-smooth">
              @if (messages().length === 0 && !isGenerating()) {
                <div class="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-60"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg><p class="font-rpg-header tracking-widest text-sm">传奇即将开始...</p></div>
              }
              @for (msg of messages(); track $index) { <app-chat-bubble [text]="msg.text" [role]="msg.role" [isStreaming]="msg.isStreaming" (interact)="handleInteraction($event)"/> }
            </div>
            
            <!-- Combat Log -->
            @if (combatLog().length > 0) {
              <div class="shrink-0 border-t-2 border-red-800/50 bg-black/20 backdrop-blur-sm p-3">
                <h4 class="font-rpg-header text-sm text-red-400 tracking-wider mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  战斗日志
                </h4>
                <div #combatLogContainer class="max-h-32 overflow-y-auto text-sm space-y-1 font-mono">
                  @for (entry of combatLog(); track $index) {
                    <p class="text-red-300/80 leading-tight animate-logEntry">
                      <span class="text-red-500/60 mr-2">></span>{{ entry.text }}
                    </p>
                  }
                </div>
              </div>
            }

            <!-- Input Area -->
            <div class="shrink-0 p-4 border-t border-[var(--border-color)] bg-[var(--bg-panel)]/80 backdrop-blur-md">
              <div class="max-w-4xl mx-auto flex flex-col gap-2">
                <div class="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style="scrollbar-width: none;">
                  <button (click)="setInput('仔细观察周围')" class="px-3 py-1 bg-[var(--bg-element)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors whitespace-nowrap">👁️ 观察</button>
                  <button (click)="setInput('检查背包物品')" class="px-3 py-1 bg-[var(--bg-element)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors whitespace-nowrap">🎒 物品</button>
                  <button (click)="setInput('使用武器攻击')" class="px-3 py-1 bg-[var(--bg-element)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-red-600 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors whitespace-nowrap">⚔️ 攻击</button>
                  <button (click)="setInput('施放法术')" class="px-3 py-1 bg-[var(--bg-element)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-blue-600 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors whitespace-nowrap">✨ 施法</button>
                  <button (click)="setInput('悄悄潜行')" class="px-3 py-1 bg-[var(--bg-element)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--text-muted)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors whitespace-nowrap">🤫 潜行</button>
                </div>
                <div class="relative">
                  <textarea #msgInput rows="2" [(ngModel)]="userInput" (keydown.enter)="handleEnterKey($event)" [disabled]="isGenerating()" placeholder="你想做什么？" class="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md p-3 pr-14 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all resize-none font-rpg-body shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
                  <button (click)="sendMessage()" [disabled]="!userInput().trim() || isGenerating()" class="absolute right-2 bottom-2 p-2 bg-[var(--accent-secondary)] hover:bg-[var(--accent-primary)] disabled:bg-[var(--bg-element)] text-white rounded transition-colors shadow-lg">
                    @if (isGenerating()) { <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> } 
                    @else { <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> }
                  </button>
                </div>
              </div>
            </div>
          }
          @case ('home') { <div class="flex items-center justify-center h-full text-center text-[var(--text-muted)] p-4"><div class="flex flex-col items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg><h2 class="text-2xl font-rpg-header">首页</h2><p>欢迎来到神话编年史。</p></div></div> }
          @case ('discover') { <div class="flex items-center justify-center h-full text-center text-[var(--text-muted)] p-4"><div class="flex flex-col items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg><h2 class="text-2xl font-rpg-header">发现</h2><p>探索其他玩家的故事和世界。</p></div></div> }
          @case ('orders') { <div class="flex items-center justify-center h-full text-center text-[var(--text-muted)] p-4"><div class="flex flex-col items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg><h2 class="text-2xl font-rpg-header">订单</h2><p>此功能尚未开放。</p></div></div> }
          @case ('me') { <div class="flex items-center justify-center h-full text-center text-[var(--text-muted)] p-4"><div class="flex flex-col items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><h2 class="text-2xl font-rpg-header">我的</h2><p>管理你的账户和角色。</p></div></div> }
        }
      </main>
    </div>
  `,
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('combatLogContainer') private combatLogContainer!: ElementRef;
  @ViewChild('msgInput') private msgInput!: ElementRef;
  
  private geminiService = inject(GeminiService);

  // UI State
  messages = signal<Message[]>([]);
  combatLog = signal<Message[]>([]);
  userInput = signal<string>('');
  isGenerating = signal<boolean>(false);
  mobileMenuCollapsed = signal<boolean>(true);
  isFullscreen = false;
  isMobile = signal<boolean>(false);
  sceneImageUrl = signal<string>('');
  isGeneratingImage = signal<boolean>(false);
  
  activeAccordion = signal<'stats' | 'attributes' | 'inventory' | null>('stats');
  activeNav = signal<'home' | 'discover' | 'play' | 'orders' | 'me'>('play');

  // Character State
  stats = signal<Stats>({
    name: '艾莉安娜',
    class: '魔剑士',
    level: 3,
    hp: 45, maxHp: 60,
    mp: 20, maxMp: 40,
    xp: 1250, maxXp: 2000,
    str: 14, dex: 16, int: 12, cha: 10,
    inventory: [
      { name: '铁剑', count: 1 },
      { name: '治疗药水', count: 3 },
      { name: '埃尔多利亚地图', count: 1 },
      { name: '火把', count: 5 }
    ]
  });

  ngOnInit() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    this.startGame();
  }

  setTheme(theme: 'dark' | 'light' | 'colorful' | 'meituan') {
    document.body.className = `bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden h-screen w-screen selection:bg-[var(--accent-secondary)] selection:text-white transition-colors duration-500`;
    if (theme !== 'dark') {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  checkMobile() {
    this.isMobile.set(window.innerWidth < 768);
    if (!this.isMobile()) {
      this.mobileMenuCollapsed.set(false);
    } else {
      this.mobileMenuCollapsed.set(true);
    }
  }

  toggleMobileMenu() {
    if (this.isMobile()) {
      this.mobileMenuCollapsed.update(v => !v);
    }
  }

  toggleAccordion(section: 'stats' | 'attributes' | 'inventory') {
    this.activeAccordion.update(current => (current === section ? null : section));
  }

  setNav(nav: 'home' | 'discover' | 'play' | 'orders' | 'me') {
    this.activeNav.set(nav);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => this.isFullscreen = true);
    } else {
      document.exitFullscreen?.().then(() => this.isFullscreen = false);
    }
  }

  async startGame() {
    this.isGenerating.set(true);
    try {
      this.geminiService.startNewGame(this.stats().name, this.stats().class);
      const startPrompt = "开始冒险。我在哪里？正在发生什么？请用中文回答。";
      await this.processAiResponse(startPrompt);
    } catch (err) {
      console.error("Failed to start game", err);
      this.messages.update(msgs => [...msgs, { role: 'model', text: '无法连接到地下城主。请检查您的网络连接或 API 密钥。' }]);
    } finally {
        this.isGenerating.set(false);
    }
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isGenerating()) return;

    this.messages.update(msgs => [...msgs, { role: 'user', text }]);
    this.userInput.set('');
    this.isGenerating.set(true);
    await this.processAiResponse(text);
  }

  async processAiResponse(prompt: string) {
    try {
      const stream = await this.geminiService.sendMessageStream(prompt);
      this.messages.update(msgs => [...msgs, { role: 'model', text: '', isStreaming: true }]);
      const streamingMessageIndex = this.messages().length - 1;
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk.text;
        this.messages.update(msgs => {
          const newMsgs = [...msgs];
          newMsgs[streamingMessageIndex] = { ...newMsgs[streamingMessageIndex], text: fullText };
          return newMsgs;
        });
        this.scrollToBottom();
      }

      this.messages.update(msgs => msgs.slice(0, -1));

      // --- NEW PARSING LOGIC ---
      let narrativeText = fullText;

      // 1. Extract and process Image Prompt
      const imagePromptMatch = narrativeText.match(/\[IMAGE_PROMPT\](.*?)\[\/IMAGE_PROMPT\]/);
      if (imagePromptMatch && imagePromptMatch[1]) {
        narrativeText = narrativeText.replace(imagePromptMatch[0], '').trim();
        this.isGeneratingImage.set(true);
        this.geminiService.generateImage(imagePromptMatch[1]).then(imageUrl => {
          if (imageUrl) {
            this.sceneImageUrl.set(imageUrl);
          }
          this.isGeneratingImage.set(false);
        });
      }
      
      // 2. Extract and process Combat Log
      const combatRegex = /\[COMBAT\](.*?)\[\/COMBAT\]/gs;
      let combatMatch;
      while ((combatMatch = combatRegex.exec(narrativeText)) !== null) {
        const combatText = combatMatch[1].trim();
        if (combatText) {
          this.combatLog.update(log => [...log, { role: 'model', text: combatText }]);
        }
      }
      narrativeText = narrativeText.replace(combatRegex, '').trim();

      // 3. Add final narrative text
      if (narrativeText) {
        this.messages.update(msgs => [...msgs, { role: 'model', text: narrativeText, isStreaming: false }]);
      }

    } catch (err) {
      console.error("Error receiving AI response", err);
      this.messages.update(msgs => {
        const lastMsg = msgs.at(-1);
        if(lastMsg?.role === 'model' && lastMsg.isStreaming) {
            msgs.pop();
        }
        return [...msgs, { role: 'model', text: "地下城主陷入了沉默（连接错误）。" }];
      });
    } finally {
      this.isGenerating.set(false);
      this.scrollToBottom();
      this.scrollToCombatLogBottom();
    }
  }
  
  handleInteraction(keyword: string) {
    const command = `调查 ${keyword}`;
    this.setInput(command);
    this.sendMessage();
  }

  setInput(text: string) {
    this.userInput.set(text);
    setTimeout(() => this.msgInput?.nativeElement.focus(), 0);
  }

  handleEnterKey(event: KeyboardEvent) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    this.scrollToCombatLogBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch(err) { /* Failsafe */ }
  }

  private scrollToCombatLogBottom(): void {
    try {
      if (this.combatLogContainer) {
        this.combatLogContainer.nativeElement.scrollTop = this.combatLogContainer.nativeElement.scrollHeight;
      }
    } catch(err) { /* Failsafe */ }
  }
}