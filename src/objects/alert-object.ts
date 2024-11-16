import {
  BLUE_TEAM_COLOR,
  RED_TEAM_COLOR,
} from "../constants/colors-constants.js";
import { BaseAnimatedGameObject } from "./base/base-animated-object.js";
import { MultiplayerGameObject } from "./interfaces/multiplayer-game-object.js";
import { WebRTCPeer } from "../services/interfaces/webrtc-peer.js";
import { ObjectType } from "../models/object-type.js";

export class AlertObject extends BaseAnimatedGameObject implements MultiplayerGameObject {
  private multilineText: string[] = ["Unknown", "message"];
  private color: string = "white";

  constructor(protected readonly canvas: HTMLCanvasElement) {
    super();
    this.setInitialValues();
    this.setSyncableValues();
  }

  public show(text: string[], color = "white"): void {
    this.multilineText = text;

    if (color === "blue") {
      this.color = BLUE_TEAM_COLOR;
    } else if (color === "red") {
      this.color = RED_TEAM_COLOR;
    } else {
      this.color = color;
    }

    this.fadeIn(0.3);
    this.scaleTo(1, 0.3);
  }

  public hide(): void {
    this.fadeOut(0.3);
    this.scaleTo(0, 0.3);
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();
    context.globalAlpha = this.opacity;

    this.setTransformOrigin(context);
    this.setFontStyle(context);
    this.renderMultilineText(context);

    context.restore();
  }

  private setTransformOrigin(context: CanvasRenderingContext2D): void {
    context.translate(this.x, this.y);
    context.scale(this.scale, this.scale);
    context.translate(-this.x, -this.y);
  }

  private setFontStyle(context: CanvasRenderingContext2D): void {
    context.font = "44px system-ui";
    context.fillStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Adding black shadow to text for readability
    context.shadowColor = "black";
    context.shadowOffsetX = 0; // Horizontal offset of shadow
    context.shadowOffsetY = 0; // Vertical offset of shadow
    context.shadowBlur = 10; // Blur effect for the shadow
  }

  private renderMultilineText(context: CanvasRenderingContext2D): void {
    const lineHeight = 42; // Adjust as needed for line spacing

    this.multilineText.forEach((line, index) => {
      const yPosition = this.y + index * lineHeight;
      this.drawText(context, line, this.x, yPosition);
    });
  }

  private drawText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
  ): void {
    // Draw filled text with shadow applied
    context.fillText(text, x, y);
  }

  private setInitialValues() {
    this.opacity = 0;
    this.scale = 0;
    this.setCenterPosition();
  }

  private setCenterPosition(): void {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
  }

  private setSyncableValues() {
    this.setSyncableId("alert-object-id");
    this.setObjectTypeId(ObjectType.Alert);
    this.setSyncableByHost(true);
  }

  public static getObjectTypeId(): ObjectType {
    return ObjectType.Alert;
  }

  public override sendSyncableData(
    webrtcPeer: WebRTCPeer,
    data: ArrayBuffer
  ): void {
    webrtcPeer.sendReliableOrderedMessage(data);
  }

  public override serialize(): ArrayBuffer {
    const textEncoder = new TextEncoder();
    const textData = textEncoder.encode(this.multilineText.join("\n"));
    const colorData = textEncoder.encode(this.color);

    const arrayBuffer = new ArrayBuffer(4 + textData.length + colorData.length);
    const dataView = new DataView(arrayBuffer);

    dataView.setFloat32(0, this.opacity);
    dataView.setFloat32(4, this.scale);

    new Uint8Array(arrayBuffer, 8, textData.length).set(textData);
    new Uint8Array(arrayBuffer, 8 + textData.length, colorData.length).set(colorData);

    return arrayBuffer;
  }

  public override synchronize(data: ArrayBuffer): void {
    const dataView = new DataView(data);

    this.opacity = dataView.getFloat32(0);
    this.scale = dataView.getFloat32(4);

    const textDecoder = new TextDecoder();
    const textData = new Uint8Array(data, 8, data.byteLength - 8);
    const colorData = new Uint8Array(data, 8 + textData.length, data.byteLength - 8 - textData.length);

    this.multilineText = textDecoder.decode(textData).split("\n");
    this.color = textDecoder.decode(colorData);
  }
}
