export interface MultiplayerGameObject {
  getSyncableId(): string;
  getSyncableType(): number;
  serialize(): Uint8Array;
  synchronize(data: Uint8Array): void;
}

export interface StaticMultiplayerGameObject {
  new (...args: any[]): MultiplayerGameObject;
  deserialize(id: string, data: Uint8Array): void;
}
