import { Container, Text } from 'pixi.js';

export interface DamageNumber {
  text: Text;
  vy: number;
  life: number;
  maxLife: number;
}

export class DamageTextManager {
  private container: Container;
  private items: DamageNumber[] = [];

  constructor(parent: Container) {
    this.container = new Container();
    parent.addChild(this.container);
  }

  public spawnDamage(x: number, y: number, amount: number, isPlayer: boolean = false): void {
    const textStr = `-${amount}`;
    const color = isPlayer ? '#ff3333' : '#ffcc00'; // Player damage in bright red, enemy damage in golden yellow

    const text = new Text({
      text: textStr,
      style: {
        fontFamily: 'Cinzel, Georgia, sans-serif',
        fontSize: 22,
        fontWeight: '900',
        fill: color,
        stroke: { color: '#1a0d00', width: 4 },
        dropShadow: {
          color: '#000000',
          blur: 4,
          distance: 2,
        },
      },
    });

    text.anchor.set(0.5);
    // Slight random offset so consecutive numbers don't overlap completely
    text.x = x + (Math.random() - 0.5) * 20;
    text.y = y - 25;
    text.scale.set(1.2); // Initial punchy scale

    this.container.addChild(text);

    this.items.push({
      text,
      vy: -50, // Float upward at 50px/sec
      life: 0.85,
      maxLife: 0.85,
    });
  }

  public update(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]!;
      item.life -= dt;

      if (item.life <= 0) {
        this.container.removeChild(item.text);
        item.text.destroy();
        this.items.splice(i, 1);
        continue;
      }

      // Move upward
      item.text.y += item.vy * dt;

      // Slight scale decay to 1.0
      const progress = item.life / item.maxLife;
      if (progress > 0.7) {
        const scale = 1.0 + (progress - 0.7) * 0.8;
        item.text.scale.set(scale);
      } else {
        item.text.scale.set(1.0);
      }

      // Fade out in last 40% of life
      if (progress < 0.4) {
        item.text.alpha = progress / 0.4;
      }
    }
  }

  public clear(): void {
    for (const item of this.items) {
      this.container.removeChild(item.text);
      item.text.destroy();
    }
    this.items = [];
  }
}
