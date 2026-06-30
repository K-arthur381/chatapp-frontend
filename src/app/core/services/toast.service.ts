import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  
  show(title: string, body: string) {
    // 1. Create toast element wrapper
    const toast = document.createElement('div');
    toast.className = 'viber-toast';
    
    // 2. Inject Viber-like layout (Purple theme, speech bubble SVG)
    toast.innerHTML = `
      <div class="viber-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.93.55 3.73 1.5 5.26L2.05 21.55c-.15.44.26.85.7.7l4.28-1.45c1.53.95 3.33 1.5 5.26 1.5 5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
        </svg>
      </div>
      <div class="viber-content">
        <div class="viber-title">${this.escapeHtml(title)}</div>
        <div class="viber-body">${this.escapeHtml(body)}</div>
      </div>
      <button class="viber-close">&times;</button>
    `;

    // 3. Inject styles directly into the document if they aren't there yet
    this.ensureStyles();

    // 4. Append container or toast directly to body
    let container = document.querySelector('.viber-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'viber-toast-container';
      document.body.appendChild(container);
    }
    container.appendChild(toast);

    // 5. Handle Close Button click
    const closeBtn = toast.querySelector('.viber-close');
    closeBtn?.addEventListener('click', () => this.dismiss(toast));

    // 6. Auto dismiss after 4 seconds
    setTimeout(() => this.dismiss(toast), 4000);
  }

  private dismiss(toast: HTMLElement) {
    toast.style.animation = 'viberFadeOut 0.3s forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

 private ensureStyles() {
    if (document.getElementById('viber-toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'viber-toast-styles';
    style.textContent = `
      .viber-toast-container {
        position: fixed;
        top: 20px; /* Changed from bottom to top */
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column; /* New toasts will stack vertically */
        gap: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .viber-toast {
        background: #ffffff;
        border-left: 5px solid #7360f2; /* Viber Purple */
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 6px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        width: 300px;
        position: relative;
        animation: viberSlideIn 0.3s ease-out;
      }
      .viber-icon {
        background: #7360f2;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;
      }
      .viber-content {
        flex-grow: 1;
        overflow: hidden;
      }
      .viber-title {
        font-weight: 600;
        color: #232323;
        font-size: 14px;
        margin-bottom: 2px;
      }
      .viber-body {
        color: #666;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .viber-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #bbb;
        cursor: pointer;
        position: absolute;
        top: 6px;
        right: 10px;
      }
      .viber-close:hover { color: #333; }
      @keyframes viberSlideIn {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes viberFadeOut {
        to { transform: translateX(40px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}