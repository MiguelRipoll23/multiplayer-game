import { EventType } from "../types/event-type.js";

export class GameEvent {
  private id: EventType;
  private data: ArrayBuffer | null;

  constructor(id: EventType, data: ArrayBuffer | null) {
    this.id = id;
    this.data = data;
  }

  public getId(): EventType {
    return this.id;
  }

  public getData(): ArrayBuffer | null {
    return this.data;
  }
}
