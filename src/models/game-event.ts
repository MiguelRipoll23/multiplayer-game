import { EventType } from "../types/event-type.js";

export class GameEvent {
  private id: EventType;
  private data: Object | null = null;
  private buffer: ArrayBuffer | null = null;

  constructor(id: EventType) {
    this.id = id;
  }

  public getId(): EventType {
    return this.id;
  }

  public getData(): Object | null {
    return this.data;
  }

  public setData(data: Object): void {
    this.data = data;
  }

  public getBuffer(): ArrayBuffer | null {
    return this.buffer;
  }

  public setBuffer(buffer: ArrayBuffer | null): void {
    this.buffer = buffer;
  }
}
