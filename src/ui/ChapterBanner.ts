import { sound } from '../audio/sound';

export interface BannerInfo {
  icon?: string;
  chapterNumber?: number;
  title: string;
  subtitle?: string;
}

export class ChapterBanner {
  private el: HTMLElement;
  private timeoutId: any = null;

  constructor() {
    const existing = document.getElementById('chapter-banner-overlay');
    if (existing) {
      this.el = existing;
    } else {
      this.el = document.createElement('div');
      this.el.id = 'chapter-banner-overlay';
      this.el.className = 'chapter-banner';
      this.el.style.display = 'none';
      document.body.appendChild(this.el);
    }
    this.injectStyles();
  }

  public show(info: BannerInfo): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    const cleanTitle = info.title.replace(/^Kapitel\s*[0-9IVX]+\s*[:–-]\s*/i, '');
    const chapterPrefix = info.chapterNumber !== undefined ? `KAPITEL ${info.chapterNumber}: ` : '';

    this.el.innerHTML = `
      <div class="banner-inner">
        <div class="banner-icon">${info.icon || '📜'}</div>
        <div class="banner-text">
          <div class="banner-main">${chapterPrefix}${cleanTitle}</div>
          ${info.subtitle ? `<div class="banner-sub">${info.subtitle}</div>` : ''}
        </div>
      </div>
      <div class="banner-glow-line"></div>
    `;

    this.el.style.display = 'flex';
    this.el.classList.remove('banner-hide');
    this.el.classList.add('banner-show');

    try {
      sound.door();
    } catch {}

    this.timeoutId = setTimeout(() => {
      this.el.classList.remove('banner-show');
      this.el.classList.add('banner-hide');
      setTimeout(() => {
        this.el.style.display = 'none';
      }, 500);
    }, 2800);
  }

  private injectStyles(): void {
    if (document.getElementById('chapter-banner-styles')) return;
    const style = document.createElement('style');
    style.id = 'chapter-banner-styles';
    style.textContent = `
      .chapter-banner {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
        transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .banner-show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .banner-hide {
        opacity: 0;
        transform: translateX(-50%) translateY(-15px);
      }
      .banner-inner {
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(180deg, rgba(30, 20, 14, 0.96) 0%, rgba(18, 12, 8, 0.98) 100%);
        border: 2px solid #d97706;
        border-radius: 8px;
        padding: 8px 24px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.8), 0 0 16px rgba(217, 119, 6, 0.35);
      }
      .banner-icon {
        font-size: 26px;
      }
      .banner-text {
        display: flex;
        flex-direction: column;
      }
      .banner-main {
        font-family: 'Cinzel', serif;
        font-size: 14.5px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #fef08a;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      }
      .banner-sub {
        font-size: 11px;
        font-weight: 600;
        color: #e5e7eb;
        letter-spacing: 0.04em;
      }
      .banner-glow-line {
        width: 70%;
        height: 2px;
        background: radial-gradient(circle, #fbbf24 0%, rgba(251, 191, 36, 0) 100%);
        margin-top: 2px;
      }
    `;
    document.head.appendChild(style);
  }
}
