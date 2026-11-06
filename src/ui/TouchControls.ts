export class TouchControls {
  public dx = 0;
  public dy = 0;
  public actionPressed = false;
  private container: HTMLDivElement | null = null;
  private knob: HTMLDivElement | null = null;
  private baseRect: DOMRect | null = null;
  private activeTouchId: number | null = null;
  private onMenuToggle?: (key: string) => void;
  private visibleWanted = true;

  constructor(onMenuToggle?: (key: string) => void) {
    this.onMenuToggle = onMenuToggle;
    this.initDOM();
  }

  public isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900;
  }

  public setVisible(visible: boolean): void {
    this.visibleWanted = visible;
    if (!this.container) return;
    this.container.style.display = visible && this.isTouchDevice() ? 'flex' : 'none';
  }

  private initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'touch-controls-overlay';
    this.container.className = 'touch-controls-overlay';
    if (!this.isTouchDevice()) {
      this.container.style.display = 'none';
    }

    // Left Joystick
    const joyBase = document.createElement('div');
    joyBase.className = 'touch-joystick-base';
    this.knob = document.createElement('div');
    this.knob.className = 'touch-joystick-knob';
    joyBase.appendChild(this.knob);

    joyBase.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.activeTouchId = touch.identifier;
        this.baseRect = joyBase.getBoundingClientRect();
        this.updateJoystick(touch.clientX, touch.clientY);
      },
      { passive: false },
    );

    joyBase.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === this.activeTouchId) {
            this.updateJoystick(t.clientX, t.clientY);
            break;
          }
        }
      },
      { passive: false },
    );

    const resetJoystick = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.activeTouchId) {
          this.activeTouchId = null;
          this.dx = 0;
          this.dy = 0;
          if (this.knob) {
            this.knob.style.transform = `translate(-50%, -50%)`;
          }
          break;
        }
      }
    };

    joyBase.addEventListener('touchend', resetJoystick, { passive: false });
    joyBase.addEventListener('touchcancel', resetJoystick, { passive: false });

    // Right Action Buttons
    const btnGroup = document.createElement('div');
    btnGroup.className = 'touch-action-buttons';

    // Sub Buttons column
    const subCol = document.createElement('div');
    subCol.className = 'touch-sub-column';

    const btnInv = document.createElement('button');
    btnInv.className = 'touch-btn touch-btn-sub';
    btnInv.innerHTML = '<span class="t-key">I</span><span class="t-sub">Tasche</span>';
    btnInv.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.onMenuToggle?.('I');
    });

    const btnPause = document.createElement('button');
    btnPause.className = 'touch-btn touch-btn-sub';
    btnPause.innerHTML = '<span class="t-key">ESC</span><span class="t-sub">Menü</span>';
    btnPause.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.onMenuToggle?.('ESC');
    });

    subCol.appendChild(btnInv);
    subCol.appendChild(btnPause);

    // Big Action Button [E]
    const btnAction = document.createElement('button');
    btnAction.className = 'touch-btn touch-btn-action';
    btnAction.innerHTML = '<span class="t-key">E</span><span class="t-sub">Aktion</span>';

    btnAction.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.actionPressed = true;
    });

    btnAction.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.actionPressed = false;
    });

    btnGroup.appendChild(subCol);
    btnGroup.appendChild(btnAction);

    this.container.appendChild(joyBase);
    this.container.appendChild(btnGroup);
    document.body.appendChild(this.container);

    window.addEventListener('resize', () => {
      if (this.container) {
        this.container.style.display = this.visibleWanted && this.isTouchDevice() ? 'flex' : 'none';
      }
    });
  }

  private updateJoystick(clientX: number, clientY: number) {
    if (!this.baseRect || !this.knob) return;
    const centerX = this.baseRect.left + this.baseRect.width / 2;
    const centerY = this.baseRect.top + this.baseRect.height / 2;

    const maxR = this.baseRect.width / 2;
    let diffX = clientX - centerX;
    let diffY = clientY - centerY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    if (dist > maxR) {
      diffX = (diffX / dist) * maxR;
      diffY = (diffY / dist) * maxR;
    }

    this.knob.style.transform = `translate(calc(-50% + ${diffX}px), calc(-50% + ${diffY}px))`;

    const deadZone = 8;
    if (dist < deadZone) {
      this.dx = 0;
      this.dy = 0;
    } else {
      this.dx = diffX / maxR;
      this.dy = diffY / maxR;
    }
  }
}
