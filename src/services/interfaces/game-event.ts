import { EventType } from "../../types/event-type.js";

export interface GameEvent {
  getId(): EventType;
}
