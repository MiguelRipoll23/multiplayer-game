export class LoggerUtils {
  private category: string;

  constructor(category: string) {
    this.category = category;
    this.info("Logger initialized");
  }

  public info(message: string, ...args: any[]): void {
    console.info(this.category, message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(this.category, message, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    console.debug(this.category, message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(this.category, message, ...args);
  }
}
