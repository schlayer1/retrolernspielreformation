import Phaser from 'phaser';
import { gameState } from '../systems/GameState';
import { sound } from '../audio/sound';

export class CompanionManager {
  private scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite | null = null;
  public isUnlocked = false;
  private state: 'following' | 'idle' | 'alert' | 'petting' = 'following';
  private alertCooldown = 0;
  private petCooldown = 0;
  private alertTarget: { x: number; y: number } | null = null;
  private sniffBubble: HTMLElement | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public unlock(startX: number, startY: number): void {
    if (this.isUnlocked && this.sprite) return;
    this.isUnlocked = true;

    if (!this.scene.textures.exists('farm_dog_idle')) return;

    this.sprite = this.scene.add.sprite(startX, startY, 'farm_dog_idle', 0);
    this.sprite.setOrigin(0.5, 0.85);
    this.sprite.setScale(1.0);
    this.sprite.setDepth(startY);

    if (this.scene.anims.exists('dog-idle')) {
      this.sprite.play('dog-idle');
    }
  }

  public pet(): string {
    if (!this.sprite) return '';
    if (this.petCooldown > 0) {
      return '🐕 Tölpel freut sich noch über deine Streicheleinheit!';
    }
    this.petCooldown = 2000;
    this.state = 'petting';
    gameState.piety = Math.min(100, gameState.piety + 2);
    gameState.notify();
    sound.playSuccess();

    const heart = this.scene.add
      .text(this.sprite.x, this.sprite.y - 20, '❤️', { fontSize: '12px' })
      .setOrigin(0.5)
      .setDepth(this.sprite.depth + 20);
    this.scene.tweens.add({
      targets: heart,
      y: heart.y - 16,
      alpha: 0,
      duration: 950,
      ease: 'Sine.easeOut',
      onComplete: () => heart.destroy(),
    });

    this.scene.time.delayedCall(900, () => {
      if (this.state === 'petting') this.state = 'idle';
    });

    const msg = '🐕 Tölpel wedelt treu mit dem Schwanz! (+2 Frömmigkeit)';
    (window as any).__showToast?.(msg);
    return msg;
  }

  public update(player: Phaser.GameObjects.Sprite, targets: any[], deltaMs: number): void {
    if (!this.isUnlocked || !this.sprite) return;

    const dog = this.sprite;
    const distToPlayer = Phaser.Math.Distance.Between(dog.x, dog.y, player.x, player.y);

    if (this.alertCooldown > 0) this.alertCooldown -= deltaMs;
    if (this.petCooldown > 0) this.petCooldown -= deltaMs;

    // Evermore Spürsinn (< 105px) zu unentdeckten Quellen/Relikten
    this.alertTarget = null;
    for (const t of targets) {
      if (!t.discovered && t.kind === 'relic') {
        const dist = Phaser.Math.Distance.Between(dog.x, dog.y, t.x, t.y);
        if (dist < 105) {
          this.alertTarget = { x: t.x, y: t.y };
          if (this.alertCooldown <= 0 && this.state !== 'petting') {
            this.state = 'alert';
            this.alertCooldown = 6000;
          }
          break;
        }
      }
    }

    // Folgen
    if (distToPlayer > 36 && this.state !== 'petting') {
      this.state = 'following';
      const angle = Phaser.Math.Angle.Between(dog.x, dog.y, player.x, player.y);
      const speed = distToPlayer > 85 ? 115 : 68;
      const step = (speed * deltaMs) / 1000;
      dog.x += Math.cos(angle) * step;
      dog.y += Math.sin(angle) * step;
      dog.setDepth(dog.y);
      dog.setFlipX(player.x < dog.x);

      if (this.scene.anims.exists('dog-walk') && dog.anims.currentAnim?.key !== 'dog-walk') {
        dog.play('dog-walk');
      }
    } else if (this.state === 'following') {
      this.state = 'idle';
      if (this.scene.anims.exists('dog-idle') && dog.anims.currentAnim?.key !== 'dog-idle') {
        dog.play('dog-idle');
      }
    }

    this.updateSniffBubble();
  }

  private updateSniffBubble(): void {
    const isModalOpen = Boolean((window as any).__isModalOpen?.());
    const labelEl = document.getElementById('world-dom-label');
    const labelVisible = Boolean(labelEl && labelEl.style.display && labelEl.style.display !== 'none');
    if (!this.sprite || !this.alertTarget || isModalOpen || labelVisible) {
      if (this.sniffBubble) this.sniffBubble.style.display = 'none';
      return;
    }

    if (!this.sniffBubble) {
      this.sniffBubble = document.getElementById('companion-bubble') || document.createElement('div');
      this.sniffBubble.id = 'companion-bubble';
      this.sniffBubble.textContent = '🐾 Witterung!';
      if (!this.sniffBubble.parentElement) {
        document.body.appendChild(this.sniffBubble);
      }
    }

    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const cam = this.scene.cameras.main;
    const sx = rect.left + ((this.sprite.x - cam.worldView.x) / cam.worldView.width) * rect.width;
    const sy = rect.top + ((this.sprite.y - 22 - cam.worldView.y) / cam.worldView.height) * rect.height;

    if (sx < rect.left || sx > rect.right || sy < rect.top || sy > rect.bottom) {
      this.sniffBubble.style.display = 'none';
      return;
    }
    this.sniffBubble.style.display = 'block';
    this.sniffBubble.style.left = `${Math.round(sx)}px`;
    this.sniffBubble.style.top = `${Math.round(Math.max(rect.top + 8, sy))}px`;
  }
}
