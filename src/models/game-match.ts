import { MatchAttributes } from "../services/interfaces/match-attributes.js";

export class GameMatch {
  private host: boolean;
  private totalSlots: number;
  private availableSlots: number;
  private attributes: MatchAttributes;

  constructor(host: boolean, totalSlots: number, attributes: MatchAttributes) {
    this.host = host;
    this.totalSlots = totalSlots;
    this.availableSlots = totalSlots - 1;
    this.attributes = attributes;
  }

  public isHost(): boolean {
    return this.host;
  }

  public getTotalSlots(): number {
    return this.totalSlots;
  }

  public getAvailableSlots(): number {
    return this.availableSlots;
  }

  public getAttributes(): MatchAttributes {
    return this.attributes;
  }

  public incrementAvailableSlots(): void {
    this.availableSlots++;
    console.log("Added slot, available slots", this.availableSlots);
  }

  public decrementAvailableSlots(): void {
    this.availableSlots--;
    console.log("Removed slot, available slots", this.availableSlots);
  }
}
