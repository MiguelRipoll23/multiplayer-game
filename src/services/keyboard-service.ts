export class KeyboardService {
  private pressedKeys: Set<string> = new Set();

  public addEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  public getPressedKeys(): Set<string> {
    return this.pressedKeys;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.pressedKeys.add(event.key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(event.key);
  }
}
