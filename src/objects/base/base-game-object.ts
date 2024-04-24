export class BaseGameObject {
  protected loaded: boolean = false;

  public load() {
    console.log(`Object ${this.constructor.name} loaded`);
    this.loaded = true;
  }

  public hasLoaded(): boolean {
    return this.loaded;
  }
}
