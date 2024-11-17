import {
  BLUE_TEAM_COLOR,
  RED_TEAM_COLOR,
} from "../constants/colors-constants.js";
import { ObjectType } from "../models/object-type.js";
import { WebRTCPeer } from "../services/interfaces/webrtc-peer.js";
import { convertColorToHex } from "../utils/color-utils.js";
import { BaseAnimatedGameObject } from "./base/base-animated-object.js";
import { MultiplayerGameObject } from "./interfaces/multiplayer-game-object.js";

export class AlertObject
  extends BaseAnimatedGameObject
  implements MultiplayerGameObject
{
  private active: boolean = false;
  private multilineText: string[] = ["Unknown", "message"];
  private color: string = "white";

  private hasBeenSynchronized: boolean = false;

  constructor(protected readonly canvas: HTMLCanvasElement) {
    super();
    this.setInitialValues();
    this.setSyncableValues();
  }

  public static getObjectTypeId(): ObjectType {
    return ObjectType.Alert;
  }

  public show(text: string[], color = "white"): void {
    this.active = true;
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
    this.sync = true;
  }

  public hide(): void {
    this.active = false;
    this.fadeOut(0.3);
    this.scaleTo(0, 0.3);
    this.sync = true;
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();
    context.globalAlpha = this.opacity;

    this.setTransformOrigin(context);
    this.setFontStyle(context);
    this.renderMultilineText(context);

    context.restore();
  }

  public override sendSyncableData(
    webrtcPeer: WebRTCPeer,
    data: ArrayBuffer,
    periodicUpdate: boolean
  ): void {
    // Skip sending data for periodic updates
    if (periodicUpdate && this.sync === false) {
      return;
    }

    console.log("Sending alert object data", this.active);
    webrtcPeer.sendReliableOrderedMessage(data);
  }

  public override serialize(): ArrayBuffer {
    const textEncoder = new TextEncoder();
    const colorHex = convertColorToHex(this.color); // Assuming this function is correct
    const colorBuffer = textEncoder.encode(colorHex); // Encoding color as a string to Uint8Array
    const textBuffer = textEncoder.encode(this.multilineText.join("\n")); // Joining and encoding text
    const activeBuffer = new Uint8Array([this.active ? 1 : 0]); // 1 for active, 0 for inactive

    // Calculate the total size of the ArrayBuffer
    const totalSize =
      4 + colorBuffer.length + activeBuffer.length + textBuffer.length;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(arrayBuffer);

    // Setting the data in the ArrayBuffer directly
    let offset = 0;

    // Store the color length (4 bytes) and slice the color data directly
    dataView.setUint32(offset, colorBuffer.length);
    offset += 4;
    new Uint8Array(arrayBuffer).set(colorBuffer, offset);
    offset += colorBuffer.length;

    // Store the active status (1 byte) and slice the active data directly
    new Uint8Array(arrayBuffer).set(activeBuffer, offset);
    offset += activeBuffer.length;

    // Store the text data (remaining bytes) and slice the text data directly
    new Uint8Array(arrayBuffer).set(textBuffer, offset);

    return arrayBuffer;
  }

  public override synchronize(data: ArrayBuffer): void {
    // Create a DataView for easy access
    const dataView = new DataView(data);
    let offset = 0;

    // Read the color length (4 bytes)
    const colorLength = dataView.getUint32(offset);
    offset += 4; // Move past the color length field

    // Slice the ArrayBuffer directly to get the color data
    const colorBuffer = new TextDecoder().decode(
      data.slice(offset, offset + colorLength)
    );
    offset += colorLength;

    // Slice the ArrayBuffer to get the active status (1 byte)
    const activeBuffer = new Uint8Array(data.slice(offset, offset + 1));
    const active = activeBuffer[0] === 1;
    offset += 1;

    // Slice the remaining ArrayBuffer for the text data
    const textBuffer = new TextDecoder().decode(data.slice(offset));

    // Split text into lines and assign to class properties
    this.color = colorBuffer;
    this.active = active;
    this.multilineText = textBuffer.split("\n");

    // Showing or hiding based on the active status.
    if (this.active) {
      this.show(this.multilineText, this.color); // Show the text with color.
    } else {
      this.hide(); // Hide if inactive.
    }
  }

  private setSyncableValues() {
    this.setSyncableId("e08fcd5c-4dd1-4efa-8a24-ac6ec1de0ae6");
    this.setObjectTypeId(ObjectType.Alert);
    this.setSyncableByHost(true);
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
}
