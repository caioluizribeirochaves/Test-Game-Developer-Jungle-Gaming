import { PlayerInputState } from '../entities/PlayerShip';

export class InputManager {
  private keyState: Map<string, boolean> = new Map();
  private virtualState: Partial<PlayerInputState> = {};
  public isActive: boolean = false;

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onKeyUpBound = this.onKeyUp.bind(this);
  }

  public attach(): void {
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
  }

  public detach(): void {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    this.reset();
  }

  public reset(): void {
    this.keyState.clear();
    this.virtualState = {};
  }

  public setVirtual(action: keyof PlayerInputState, value: boolean): void {
    this.virtualState[action] = value;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.isActive) return;

    // Prevent default browser scrolling on arrow keys and space when game is active
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    this.keyState.set(e.code, true);
  }

  private onKeyUp(e: KeyboardEvent): void {
    if (!this.isActive) return;
    this.keyState.set(e.code, false);
  }

  public getInputState(): PlayerInputState {
    if (!this.isActive) {
      return {
        forward: false,
        turnLeft: false,
        turnRight: false,
        fireFront: false,
        fireLeft: false,
        fireRight: false,
      };
    }

    const isDown = (codes: string[]) => codes.some((code) => this.keyState.get(code) === true);

    const forward = isDown(['KeyW', 'ArrowUp']) || !!this.virtualState.forward;
    const turnLeft = isDown(['KeyA', 'ArrowLeft']) || !!this.virtualState.turnLeft;
    const turnRight = isDown(['KeyD', 'ArrowRight']) || !!this.virtualState.turnRight;
    const fireFront = isDown(['Space', 'KeyJ']) || !!this.virtualState.fireFront;
    const fireLeft = isDown(['KeyQ', 'KeyK', 'KeyU']) || !!this.virtualState.fireLeft;
    const fireRight = isDown(['KeyE', 'KeyL', 'KeyO']) || !!this.virtualState.fireRight;

    return {
      forward,
      turnLeft,
      turnRight,
      fireFront,
      fireLeft,
      fireRight,
    };
  }
}
