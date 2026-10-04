import { PlayerInputState, PlayerActionKey } from '../entities/PlayerShip';

export interface JoystickInputState {
  active: boolean;
  x: number;
  y: number;
  angle: number;
  intensity: number;
}

export class InputManager {
  private keyState: Map<string, boolean> = new Map();
  private virtualState: Partial<Record<PlayerActionKey, boolean>> = {};
  private joystick: JoystickInputState = { active: false, x: 0, y: 0, angle: 0, intensity: 0 };
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
    this.joystick = { active: false, x: 0, y: 0, angle: 0, intensity: 0 };
  }

  public setVirtual(action: PlayerActionKey, value: boolean): void {
    this.virtualState[action] = value;
  }

  public setJoystick(x: number, y: number, active: boolean): void {
    this.joystick.active = active;
    this.joystick.x = x;
    this.joystick.y = y;
    if (active) {
      const len = Math.hypot(x, y);
      this.joystick.intensity = Math.min(1, len);
      this.joystick.angle = Math.atan2(y, x);
    } else {
      this.joystick.intensity = 0;
      this.joystick.angle = 0;
    }
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
        joystickActive: false,
        joystickAngle: 0,
        joystickIntensity: 0,
      };
    }

    const isDown = (codes: string[]) => codes.some((code) => this.keyState.get(code) === true);

    const forward =
      isDown(['KeyW', 'ArrowUp']) ||
      !!this.virtualState.forward ||
      (this.joystick.active && this.joystick.intensity > 0.15);
    const turnLeft =
      isDown(['KeyA', 'ArrowLeft']) ||
      !!this.virtualState.turnLeft ||
      (this.joystick.active && this.joystick.x < -0.25);
    const turnRight =
      isDown(['KeyD', 'ArrowRight']) ||
      !!this.virtualState.turnRight ||
      (this.joystick.active && this.joystick.x > 0.25);
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
      joystickActive: this.joystick.active,
      joystickAngle: this.joystick.angle,
      joystickIntensity: this.joystick.intensity,
    };
  }
}
