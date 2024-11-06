import { MatchAttributes } from "../match-attributes.js";

export interface FindMatchRequest {
  version: string;
  attributes: MatchAttributes;
  total_slots: number;
}
