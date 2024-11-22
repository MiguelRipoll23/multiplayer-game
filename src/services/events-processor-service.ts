import { EVENT_ID } from "../constants/webrtc-constants.js";
import { EventType } from "../models/event-type.js";
import { GameController } from "../models/game-controller.js";
import { GameEvent } from "../models/game-event.js";
import { WebRTCPeer } from "./interfaces/webrtc-peer.js";
import { WebRTCService } from "./webrtc-service.js";

export class EventsProcessorService {
  private webrtcService: WebRTCService;
  private events: GameEvent[] = [];

  constructor(private gameController: GameController) {
    this.webrtcService = gameController.getWebRTCService();
  }

  public handleRemoteEvent(webrtcPeer: WebRTCPeer, data: ArrayBuffer | null) {
    if (data === null) {
      return console.warn("Received null data from peer");
    }

    if (webrtcPeer.getPlayer()?.isHost() === false) {
      return console.warn("Received event from non-host player");
    }

    const dataView = new DataView(data);

    const id = dataView.getInt8(0);
    const payload = data.byteLength > 1 ? data.slice(1) : null;

    const event = new GameEvent(id, payload);
    this.events.push(event);
  }

  public listenEvent(
    eventId: EventType,
    callback: (data: ArrayBuffer | null) => void
  ) {
    this.events.forEach((event) => {
      if (event.getId() === eventId) {
        callback(event.getData());
        this.removeEvent(event);
      }
    });
  }

  public sendEvent(event: GameEvent) {
    this.webrtcService.getPeers().forEach((webrtcPeer) => {
      if (webrtcPeer.hasJoined()) {
        this.sendEventToPeer(webrtcPeer, event);
      }
    });
  }

  private removeEvent(event: GameEvent) {
    const index = this.events.indexOf(event);

    if (index > -1) {
      this.events.splice(index, 1);
    }
  }

  private sendEventToPeer(webrtcPeer: WebRTCPeer, event: GameEvent) {
    const id = event.getId();
    const data = event.getData();

    const dataBytesLength = data?.byteLength ?? 0;

    const arrayBuffer = new ArrayBuffer(2 + dataBytesLength);

    const dataView = new DataView(arrayBuffer);
    dataView.setInt8(0, EVENT_ID);
    dataView.setUint8(1, id);

    if (data) {
      new Uint8Array(arrayBuffer).set(new Uint8Array(data), 2);
    }

    webrtcPeer.sendReliableOrderedMessage(arrayBuffer);
  }
}
