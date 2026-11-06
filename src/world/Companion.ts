import Phaser from 'phaser';

export class CompanionManager {
  private scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite | null = null;
  public isUnlocked = false;
  private state: 'following' | 'idle' | 'alert' | 'petting' = 'following';
  private idleTimer = 0;
  private alertCooldown = 0;

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

  public update(player: Phaser.GameObjects.Sprite, targets: any[], deltaMs: number): void {
    if (!this.isUnlocked || !this.sprite) return;

    const dog = this.sprite;
    const distToPlayer = Phaser.Math.Distance.Between(dog.x, dog.y, player.x, player.y);

    if (this.alertCooldown > 0) this.alertCooldown -= deltaMs;

    // Evermore Spürsinn (< 90px) zu unentdeckten Quellen/Relikten
    if (this.alertCooldown <= 0 && this.state !== 'petting') {
      for (const t of targets) {
        if (!t.discovered && t.kind === 'relic') {
          const dist = Phaser.Math.Distance.Between(dog.x, dog.y, t.x, t.y);
          if (dist < 90) {
            this.state = 'alert';
            this.alertCooldown = 5000;
            break;
          }
        }
      }
    }

    // Folgen
    if (distToPlayer > 36) {
      this.state = 'following';
      const angle = Phaser.Math.Angle.Between(dog.x, dog.y, player.x, player.y);
      const speed = distToPlayer > 80 ? 110 : 65;
      const step = (speed * deltaMs) / 1000;
      dog.x += Math.cos(angle) * step;
      dog.y += Math.sin(angle) * step;
      dog.setDepth(dog.y);
      dog.setFlipX(player.x < dog.x);

      if (this.scene.anims.exists('dog-walk') && dog.anims.currentAnim?.key !== 'dog-walk') {
        dog.play('dog-walk');
      }
    } else {
      if (this.state === 'following') {
        this.state = 'idle';
        if (this.scene.anims.exists('dog-idle') && dog.anims.currentAnim?.key !== 'dog-idle') {
          dog.play('dog-idle');
        }
      }
    }
  }
}
